import Link from "next/link";
import type { Campaign } from "@murmur/types";
import { apiFetch } from "../../../lib/api";

export default async function CampaignsPage() {
  const campaigns = await apiFetch<Campaign[]>("/campaigns");

  return (
    <div>
      <h1>Campaigns</h1>
      {campaigns.map((campaign) => (
        <div className="card" key={campaign.id}>
          <strong>{campaign.name}</strong>
          <p>Status: {campaign.status}</p>
          <Link href={`/campaigns/${campaign.id}`}>Open</Link>
        </div>
      ))}
    </div>
  );
}
