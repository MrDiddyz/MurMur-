import { NextRequest, NextResponse } from "next/server";
import { enqueueScheduledPublish } from "@/lib/scheduler/queue";
import { countPostsInHour, getPostById, updatePostSchedule } from "@/lib/scheduler/repository";
import { optimizeScheduleTime } from "@/lib/scheduler/scheduler";

type RequestBody = {
  post_id: string;
  scheduled_at?: string;
  auto_optimize: boolean;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RequestBody;
  if (!body?.post_id) {
    return NextResponse.json({ error: "post_id is required" }, { status: 400 });
  }

  const post = await getPostById(body.post_id);
  if (!post) {
    return NextResponse.json({ error: "post not found" }, { status: 404 });
  }

  const requested = body.scheduled_at ? new Date(body.scheduled_at) : undefined;
  if (requested && Number.isNaN(requested.getTime())) {
    return NextResponse.json({ error: "scheduled_at must be an ISO timestamp" }, { status: 400 });
  }

  const existingInHour = await countPostsInHour(post.account_id, requested ?? new Date());
  const accountInHour = await countPostsInHour(post.account_id, requested ?? new Date());

  const optimized = optimizeScheduleTime({
    requested: body.auto_optimize ? undefined : requested,
    existingInHourCount: existingInHour,
    accountHourlyCount: accountInHour,
    post: {
      id: post.id,
      accountId: post.account_id,
      createdAt: post.created_at,
      priorityScore: post.priority_score,
    },
  });

  const scheduledAt = body.auto_optimize ? optimized.scheduledAt : requested ?? optimized.scheduledAt;

  await updatePostSchedule({
    postId: body.post_id,
    scheduledAt,
    priorityScore: optimized.priorityScore,
    autoSchedule: body.auto_optimize,
    reason: optimized.reason,
  });

  await enqueueScheduledPublish(body.post_id, scheduledAt);

  return NextResponse.json({
    post_id: body.post_id,
    scheduled_at: scheduledAt.toISOString(),
    priority_score: optimized.priorityScore,
  });
}
