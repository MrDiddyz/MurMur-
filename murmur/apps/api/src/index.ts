import { bootstrapRuntime } from "@murmur/core";
import { buildApi } from "./app.js";
import { getApiEnv } from "./config/env.js";

const runtime = bootstrapRuntime();
const app = buildApi(runtime);
const env = getApiEnv();

app.listen({ port: env.port, host: "0.0.0.0" }).catch((error: unknown) => {
  app.log.error(error);
  process.exit(1);
});
