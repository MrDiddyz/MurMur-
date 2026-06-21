import Generator from '@/components/Generator';

export default function GeneratePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">AI Image Generator</h1>
          <p className="text-slate-600">Enter a prompt and generate a set of 4 AI images.</p>
        </header>

        <Generator />
      </div>
    </main>
  );
}
