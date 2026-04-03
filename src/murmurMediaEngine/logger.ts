import { nowIso } from "./utils";

export type LogLevel = "info" | "warn" | "error";

export const logJson = (
  level: LogLevel,
  message: string,
  context: Record<string, unknown>,
) => {
  const line = {
    timestamp: nowIso(),
    level,
    message,
    ...context,
  };
  console.log(JSON.stringify(line));
};
