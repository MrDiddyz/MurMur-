import { randomUUID } from "node:crypto";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";

export type Session = {
  id: string;
  process: ChildProcessWithoutNullStreams;
};

export function spawnDockerSession(image: string, command: string[]): Session {
  const id = randomUUID();
  const args = ["run", "--rm", "-i", image, ...command];
  const process = spawn("docker", args, { stdio: "pipe" });
  return { id, process };
}
