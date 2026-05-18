import { ReflectionForm } from '@/components/reflection-form';

export const metadata = {
  title: 'Reflect — MurMur Learning Lab',
  description: 'Write a reflection and receive AI-powered insights.',
};

export default function ReflectionPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-mirror/80">
          Reflection
        </p>
        <h1 className="text-3xl font-bold text-white">{"What's on your mind?"}</h1>
        <p className="text-ink/70">
          Write freely. Your reflection will be mirrored back with insights,
          a next step, and a creative spark — then saved to your constellation.
        </p>
      </header>

      <div className="card">
        <ReflectionForm />
      </div>
    </div>
  );
}
