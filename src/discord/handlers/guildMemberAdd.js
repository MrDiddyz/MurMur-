import { hashUserId, logEvent, logAction } from "../../log/events.js";
import { config } from "../../config.js";

export function onGuildMemberAdd(client) {
  client.on("guildMemberAdd", async (member) => {
    try {
      const guildId = String(member.guild.id);
      const userHash = hashUserId(member.user.id);

      await logEvent({
        event_type: "member_join",
        guild_id: guildId,
        channel_id: null,
        user_id_hash: userHash,
        payload: {}
      });

      const channel = member.guild.channels.cache.find(
        (c) => c?.isTextBased?.() && typeof c.send === "function" && c.name === config.welcomeChannelName
      );

      if (channel) {
        const msg =
          `Velkommen <@${member.user.id}>! 🎧\n` +
          `Si gjerne: hva lager du, og hva vil du bli bedre på?`;
        await channel.send(msg);

        await logAction({
          action_type: "welcome_sent",
          guild_id: guildId,
          channel_id: String(channel.id),
          correlation_id: null,
          input: { welcomeChannelName: config.welcomeChannelName }
        });
      }
    } catch (err) {
      console.error("guildMemberAdd handler error:", err);
    }
  });
}
