import { mockScanInput } from "@/lib/opportunity-scanner";

const fields = [
  ["Business name", mockScanInput.businessName],
  ["Website URL", mockScanInput.websiteUrl],
  ["Facebook page URL", mockScanInput.facebookUrl],
  ["Google Business Profile URL", mockScanInput.googleBusinessProfileUrl],
  ["Industry", mockScanInput.industry],
  ["Location", mockScanInput.location],
  ["Main offer", mockScanInput.mainOffer],
];

export default function NewScanPage() {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h1 className="text-2xl font-semibold text-amber-200">New Scan</h1>
      <p className="mt-1 text-sm text-zinc-300">Demo input form (mock mode). No external APIs are connected yet.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {fields.map(([label, value]) => (
          <label key={label} className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-400">{label}</span>
            <input
              defaultValue={value}
              readOnly
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
