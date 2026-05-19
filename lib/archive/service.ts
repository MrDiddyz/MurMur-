import { randomUUID } from "crypto";
import { archiveCreateSchema } from "@/lib/validation/archive";
import { logEvent } from "@/lib/events/logger";

export async function createArchiveItem(input: unknown) {
  const payload = archiveCreateSchema.parse(input);
  const item = { id: randomUUID(), created_at: new Date().toISOString(), ...payload };
  logEvent({ event_id: randomUUID(), type: "archive_created", source: "archive.service", timestamp: new Date().toISOString(), user_id: "system", payload: { archiveId: item.id } });
  return item;
}
