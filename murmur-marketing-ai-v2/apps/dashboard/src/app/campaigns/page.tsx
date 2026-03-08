import type { Campaign } from "@murmur/types";

const sampleCampaigns: Campaign[] = [
  {
    id: "cmp_001",
    name: "Midnight Echo Launch",
    status: "active",
    budgetUSD: 2500,
    primaryGenre: "indie-pop",
    channels: [
      { name: "spotify", objective: "Playlist placements", cadencePerWeek: 2 },
      { name: "tiktok", objective: "UGC momentum", cadencePerWeek: 4 }
    ],
    releasePlan: {
      title: "Midnight Echo",
      artistName: "Neon Harbor",
      releaseDateISO: "2026-01-10",
      goals: ["50k streams first month", "15 playlist adds"],
      timeline: [
        { weekOffset: -4, milestone: "Pre-save launch", owner: "manager" },
        { weekOffset: -2, milestone: "Creator seeding", owner: "artist" },
        { weekOffset: 0, milestone: "Release day campaign", owner: "platform" }
      ]
    },
    createdAtISO: "2025-10-01T00:00:00.000Z",
    updatedAtISO: "2025-10-02T00:00:00.000Z"
  }
];

export default function CampaignsPage() {
  return (
    <main>
      <h1>Campaigns</h1>
      <p>Live integrations are pending. Records shown are local samples for UI scaffolding.</p>
      {sampleCampaigns.map((campaign) => (
        <article key={campaign.id} className="panel">
          <h2>{campaign.name}</h2>
          <p>
            Status: <strong>{campaign.status}</strong> · Genre: {campaign.primaryGenre} · Budget: ${campaign.budgetUSD}
          </p>
          <h3>Channels</h3>
          <ul>
            {campaign.channels.map((channel) => (
              <li key={channel.name}>
                {channel.name.toUpperCase()}: {channel.objective} ({channel.cadencePerWeek}/week)
              </li>
            ))}
          </ul>
        </article>
      ))}
    </main>
  );
}
