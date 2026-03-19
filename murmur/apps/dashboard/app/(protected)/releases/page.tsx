import type { Release } from "@murmur/types";
import { apiFetch } from "../../../lib/api";

export default async function ReleasesPage() {
  const releases = await apiFetch<Release[]>("/releases");

  return (
    <div>
      <h1>Releases</h1>
      {releases.map((release) => (
        <div className="card" key={release.id}>
          <strong>{release.title}</strong>
          <p>Status: {release.status}</p>
        </div>
      ))}
    </div>
  );
}
