import { generateAIResponse } from "../../ai/openai.js";
import { hashUserId, logEvent, logAction } from "../../log/events.js";
import { config } from "../../config.js";
import crypto from "crypto";

const perUser = new Map();

function allowUser(userId) {
  const now = Date.now();
  const entry = perUser.get(userId);

  if (!entry) {
    perUser.set(userId, { windowStartMs: now, count: 1 });
    return true;
  }

  if (now - entry.windowStartMs > 60_000) {
    perUser.set(userId, { windowStartMs: now, count: 1 });
    return true;
  }

  if (entry.count >= config.maxAiReplyPerUserPerMin) return false;

  entry.count += 1;
  return true;
}

export function onMessageCreate(client) {
  client.on("messageCreate", async (message) => {
    try {
      if (!message?.guild || message.author?.bot) return;

      const guildId = String(message.guild.id);
      const channelId = String(message.channel.id);
      const userHash = hashUserId(message.author.id);

      await logEvent({
        event_type: "message_create",
        guild_id: guildId,
        channel_id: channelId,
        user_id_hash: userHash,
        payload: {
          content_len: message.content?.length || 0,
          has_attachments: message.attachments?.size > 0
        }
      });

      if (!/^!ask\b/i.test(message.content || "")) return;

      if (!allowUser(message.author.id)) {
        await message.reply("⏳ Litt for mange forespørsler nå — prøv igjen om et minutt.");
        return;
      }

      const prompt = message.content.replace(/^!ask\s*/i, "").trim();
      if (!prompt) {
        await message.reply("Skriv f.eks: `!ask gi meg 3 ideer til en live performance setup`");
        return;
      }

      const correlationId = crypto.randomUUID();
      await logAction({
        action_type: "ai_request",
        guild_id: guildId,
        channel_id: channelId,
        correlation_id: correlationId,
        input: { prompt }
      });

      const answer = await generateAIResponse(prompt);

      await message.reply(answer);

      await logAction({
        action_type: "ai_response",
        guild_id: guildId,
        channel_id: channelId,
        correlation_id: correlationId,
        output: { answer_len: answer.length }
      });
    } catch (err) {
      console.error("messageCreate handler error:", err);
      try {
        await message.reply("Jeg fikk en feil nå. Prøv igjen om litt.");
      } catch {}
    }
  });
}
