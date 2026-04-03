declare module "node:http" {
  export function createServer(handler: (req: any, res: any) => void): { listen: (port: number, cb?: () => void) => void };
}

declare module "node:crypto" {
  export function randomUUID(): string;
}

declare module "node:fs" {
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function readFileSync(path: string, encoding: string): string;
  export function writeFileSync(path: string, data: string, encoding: string): void;
}

declare module "node:path" {
  export function dirname(path: string): string;
  export function join(...paths: string[]): string;
}

declare const process: {
  cwd(): string;
  env: Record<string, string | undefined>;
  exit(code?: number): void;
};

declare class Buffer {
  static from(input: any): Buffer;
  static concat(chunks: Buffer[]): Buffer;
  toString(encoding?: string): string;
}
