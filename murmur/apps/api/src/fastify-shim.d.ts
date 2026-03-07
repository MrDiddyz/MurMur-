declare module "fastify" {
  export interface FastifyInstance {
    get: (...args: any[]) => unknown;
    post: (...args: any[]) => unknown;
    register: (...args: any[]) => unknown;
    listen: (...args: any[]) => Promise<unknown>;
    log: { error: (error: unknown) => void };
  }

  export type FastifyPluginAsync<TOptions = unknown> = (
    app: FastifyInstance,
    opts: TOptions
  ) => Promise<void>;

  export default function Fastify(options?: unknown): FastifyInstance;
}
