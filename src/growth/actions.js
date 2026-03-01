import { generateAIResponse } from "../ai/openai.js";
import { logAction } from "../log/events.js";
import crypto from "crypto";
import { config } from "../config.js";

function findTextChannelByName(guild, name) {
  return guild.channels.cache.find((c) => c?.isTextBased?.() && c.name === name);
}

export async function executeGrowthAction({ client, guild, action }) {
  const channel = findTextChannelByName(guild, config.welcomeChannelName);
  if (!channel) throw new Error(`Channel not found: ${config.welcomeChannelName}`);

  const correlationId = crypto.randomUUID();
  const guildId = String(guild.id);
  const channelId = String(channel.id);

  await logAction({
    action_type: "growth_decision",
    guild_id: guildId,
    channel_id: channelId,
    correlation_id: correlationId,
    input: { action }
  });

  if (action.type === "NO_ACTION") {
    await logAction({
      action_type: "growth_no_action",
      guild_id: guildId,
      channel_id: channelId,
      correlation_id: correlationId,
      output: { reason: action.reason }
    });
    return { didPost: false, correlationId };
  }

  let text = "";

  if (action.type === "WELCOME_PROMPT") {
    text =
      "👋 Velkommen til alle nye!\n" +
      "Si gjerne kort: hva lager du (artist/producer/dev), og hva vil du lære eller bygge her denne uka?";
  }

  if (action.type === "SOFT_CHECKIN") {
    text =
      "🧭 Sjekk inn: Hva jobber du med akkurat nå?\n" +
      "Del én ting du bygger, én ting du sliter med, eller én ting du vil teste i dag.";
  }

  if (action.type === "ENGAGEMENT_QUESTION") {
    const prompt =
      "Skriv ett høy-engasjement spørsmål til et Discord community for live music production. " +
      "Språk: norsk. Ikke clickbait. Maks 2 setninger. Avslutt med et enkelt spørsmålstegn.";
    text = await generateAIResponse(prompt);
  }

  await channel.send(`🔥 ${text}`);

  await logAction({
    action_type: "growth_posted",
    guild_id: guildId,
    channel_id: channelId,
    correlation_id: correlationId,
    output: { postedType: action.type, preview: text.slice(0, 140) }
  });

  return { didPost: true, correlationId };
}
