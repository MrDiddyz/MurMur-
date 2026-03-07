declare module "fastify" {
  export interface FastifyReply {
    send(payload: unknown): unknown;
  }

  export interface FastifyRequest {
    body: any;
  }

  export interface FastifyInstance {
    get(path: string, handler: () => unknown | Promise<unknown>): void;
    post<T = unknown>(
      path: string,
      handler: (request: FastifyRequest, reply: FastifyReply) => unknown
    ): void;
    register<T>(plugin: FastifyPluginAsync<T>, opts: T): void;
    listen(options: { port: number; host: string }): Promise<void>;
    log: {
      error(error: unknown): void;
    };
  }

  export type FastifyPluginAsync<T = unknown> = (
    app: FastifyInstance,
    opts: T
  ) => Promise<void>;

  export default function Fastify(options?: { logger?: boolean }): FastifyInstance;
}
