import Fastify from "fastify";
import { z } from "zod";

const app = Fastify({ logger: true });

app.post("/execute", async (request) => {
  const { code, language } = z
    .object({ code: z.string(), language: z.literal("typescript") })
    .parse(request.body);

  // TODO: Replace with hardened containerized execution runtime.
  return {
    language,
    stdout: `Mock execution accepted (${code.length} chars).`,
    stderr: "",
    exitCode: 0
  };
});

app.get("/health", async () => ({ ok: true }));

const port = Number(process.env.SANDBOX_PORT ?? 4003);
app
  .listen({ port, host: "0.0.0.0" })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
