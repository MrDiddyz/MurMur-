import { bootstrapRuntime } from "@murmur/core";
import { buildApi } from "./app.js";

const runtime = bootstrapRuntime();
const app = buildApi(runtime);

const port = Number(process.env.PORT ?? 3001);

app.listen({ port, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
