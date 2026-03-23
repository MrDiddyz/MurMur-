import { NextResponse } from "next/server";
import { createEntryForUser, getMemoryUserId, listEntriesForUser } from "@/lib/memory/service";

export async function GET(): Promise<NextResponse> {
  try {
    const userId = getMemoryUserId();
    const { entries, source } = await listEntriesForUser(userId);
    return NextResponse.json({ entries, source });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { text?: string; tags?: string[]; mood?: string };
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const entry = await createEntryForUser({
      userId: getMemoryUserId(),
      text,
      tags: body.tags,
      mood: body.mood
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
