import crypto from "crypto";

export function stableHash(input: unknown) {
  const json = JSON.stringify(input, Object.keys(input as any).sort());
  return crypto.createHash("sha256").update(json).digest("hex").slice(0, 16);
}

export function keyJoin(parts: (string | number | null | undefined)[]) {
  return parts.filter((p) => p !== null && p !== undefined && p !== "").join(":");
}

/**
 * Cache key format (example):
 * murmur:v1:tag(products)=3:products:filters=ab12cd34
 */
export function makeKey(opts: {
  namespace: string; // "murmur"
  apiVersion: string; // "v1"
  tag: string; // "products" | "dashboard" | ...
  tagVersion: number; // from Redis
  resource: string; // "products" | "dashboard"
  paramsHash?: string; // stable hash of args
}) {
  return keyJoin([
    opts.namespace,
    opts.apiVersion,
    `tag(${opts.tag})=${opts.tagVersion}`,
    opts.resource,
    opts.paramsHash ? `p=${opts.paramsHash}` : null,
  ]);
}
