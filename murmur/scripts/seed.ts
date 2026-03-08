import { createSupabaseAdminClient } from "@murmur/config";

const supabase = createSupabaseAdminClient();

function assertNoError(error: { message: string } | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

async function run() {
  const { data: artist, error: artistError } = await supabase
    .from("artists")
    .upsert({ name: "Demo Artist", slug: "demo-artist" }, { onConflict: "slug" })
    .select("*")
    .single();

  assertNoError(artistError, "Failed to upsert artist");

  const { data: release, error: releaseError } = await supabase
    .from("releases")
    .insert({
      artist_id: artist.id,
      title: "Neon Horizon",
      genre: "Indie Pop",
      release_date: new Date().toISOString().slice(0, 10),
      status: "scheduled"
    })
    .select("*")
    .single();

  assertNoError(releaseError, "Failed to create release");

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .insert({
      release_id: release.id,
      name: "Neon Horizon Launch",
      objective: "Grow streams",
      budget: 2500,
      status: "active"
    })
    .select("*")
    .single();

  assertNoError(campaignError, "Failed to create campaign");

  const { error: contentPackError } = await supabase.from("content_packs").insert([
    {
      campaign_id: campaign.id,
      platform: "tiktok",
      content_type: "short_video",
      hook: "POV: your new anthem drops tonight",
      caption: "Neon Horizon out at midnight",
      asset_url: "https://example.com/assets/neon-1.mp4"
    },
    {
      campaign_id: campaign.id,
      platform: "instagram",
      content_type: "reel",
      hook: "Studio snippet",
      caption: "Built this track for late-night drives",
      asset_url: "https://example.com/assets/neon-2.mp4"
    }
  ]);

  assertNoError(contentPackError, "Failed to insert content packs");

  const today = new Date();
  const snapshots = Array.from({ length: 5 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (4 - index));

    return {
      campaign_id: campaign.id,
      platform: "spotify",
      metric_date: date.toISOString().slice(0, 10),
      streams: 1000 + index * 350,
      views: 500 + index * 120,
      likes: 100 + index * 25,
      comments: 20 + index * 4,
      shares: 10 + index * 3,
      saves: 40 + index * 8,
      followers_gained: 15 + index * 2
    };
  });

  const { error: analyticsError } = await supabase.from("analytics_snapshots").upsert(snapshots, {
    onConflict: "campaign_id,platform,metric_date"
  });

  assertNoError(analyticsError, "Failed to upsert analytics snapshots");

  console.log("Seed complete", {
    artistId: artist.id,
    releaseId: release.id,
    campaignId: campaign.id
  });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
