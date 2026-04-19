import Link from 'next/link';
import { ContactForm } from '@/components/contact-form';

export default function ContactPage() {
  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-4xl font-semibold">Kontakt</h1>
      <p className="text-ink">Fortell kort om behovet ditt, så foreslår vi riktig modul og neste steg.</p>
      <ContactForm />
      <div className="card">
        <h2 className="text-xl font-semibold">Book en discovery call</h2>
        <p className="mt-2 text-sm text-ink">Velg tidspunkt via kalenderlenken under (placeholder).</p>
        <Link href="https://cal.com/placeholder/murmur" className="mt-3 inline-block text-accent underline" target="_blank">
          Åpne booking
        </Link>
      </div>
      <p className="text-sm text-ink">Alternativt: <a href="mailto:hello@murmur.no" className="text-white underline">hello@murmur.no</a></p>
    </div>
  );
}
