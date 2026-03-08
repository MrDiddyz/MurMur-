import Link from "next/link";
import { loadRuntimeConfig } from "@murmur/config";

export default function HomePage() {
  const config = loadRuntimeConfig();

  return (
    <main>
      <h1>Murmur Marketing AI v2</h1>
      <p>
        Production-ready starter for release planning, content generation, playlist intelligence, social prep,
        and analytics foundations.
      </p>

      <section className="panel">
        <h2>Platform Readiness</h2>
        <ul>
          <li>API Base URL: {config.apiBaseUrl}</li>
          <li>Supabase: placeholder adapter</li>
          <li>Spotify: placeholder adapter</li>
          <li>TikTok: placeholder adapter</li>
        </ul>
      </section>

      <section className="panel">
        <h2>Campaign Operations</h2>
        <p>Plan and inspect campaign prep packets in one place.</p>
        <Link href="/campaigns">Open campaigns dashboard →</Link>
      </section>
    </main>
  );
}
