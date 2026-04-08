'use client';

export function ContactForm() {
  return (
    <form name="contact" method="POST" data-netlify="true" className="card space-y-4">
      <input type="hidden" name="form-name" value="contact" />

      <label className="block space-y-2 text-sm text-ink">
        <span>Name</span>
        <input
          type="text"
          name="name"
          required
          className="w-full rounded-xl border border-white/20 bg-white/5 p-3 text-white"
        />
      </label>

      <label className="block space-y-2 text-sm text-ink">
        <span>Email</span>
        <input
          type="email"
          name="email"
          required
          className="w-full rounded-xl border border-white/20 bg-white/5 p-3 text-white"
        />
      </label>

      <label className="block space-y-2 text-sm text-ink">
        <span>Company</span>
        <input
          type="text"
          name="company"
          className="w-full rounded-xl border border-white/20 bg-white/5 p-3 text-white"
        />
      </label>

      <label className="block space-y-2 text-sm text-ink">
        <span>Module of interest</span>
        <select
          name="module"
          className="w-full rounded-xl border border-white/20 bg-white/5 p-3 text-white"
          defaultValue="MurMur Core"
        >
          <option>MurMur Core</option>
          <option>Web Intelligence</option>
          <option>Security Lab</option>
        </select>
      </label>

      <label className="block space-y-2 text-sm text-ink">
        <span>Message</span>
        <textarea
          name="message"
          className="min-h-32 w-full rounded-xl border border-white/20 bg-white/5 p-3 text-white"
        />
      </label>

      <button
        type="submit"
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-night"
      >
        Send Message
      </button>
    </form>
  );
}
