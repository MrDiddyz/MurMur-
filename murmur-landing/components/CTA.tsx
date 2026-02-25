export default function CTA() {
  return (
    <section className="bg-slate-950 py-20 text-white">
      <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
        <h2 className="text-3xl font-semibold sm:text-4xl">Ready to turn security data into action?</h2>
        <p className="mt-4 text-slate-300">
          Book a personalized walkthrough and see how MurMur helps your team move from alert to
          resolution in record time.
        </p>
        <button className="mt-8 rounded-lg bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
          Schedule a walkthrough
        </button>
      </div>
    </section>
  );
}
