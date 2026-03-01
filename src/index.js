import { createDiscordClient } from "./discord/client.js";
import { onMessageCreate } from "./discord/handlers/messageCreate.js";
import { onGuildMemberAdd } from "./discord/handlers/guildMemberAdd.js";
import { config } from "./config.js";
import { startHourlyAggregator } from "./metrics/hourlyAggregator.js";
import { startGrowthScheduler } from "./growth/scheduler.js";

const client = createDiscordClient();

client.once("ready", () => {
  console.log(`✅ MurMur Node online as ${client.user.tag}`);
  startHourlyAggregator();
  startGrowthScheduler(client);
});

onMessageCreate(client);
onGuildMemberAdd(client);

client.login(config.discordToken);
