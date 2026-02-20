'use server';

import { promises as fs } from 'node:fs';
import path from 'node:path';

const contactFile = path.join(process.cwd(), 'modules', 'contact-submissions.json');

type ContactState = {
  success: boolean;
  message: string;
};

export async function submitContact(_: ContactState, formData: FormData): Promise<ContactState> {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!name || !email || !message || !email.includes('@')) {
    return { success: false, message: 'Vennligst fyll ut alle felt med gyldig e-post.' };
  }

  const record = { name, email, message, createdAt: new Date().toISOString() };

  try {
    await fs.mkdir(path.dirname(contactFile), { recursive: true });
    let existing: unknown[] = [];
    try {
      const raw = await fs.readFile(contactFile, 'utf8');
      existing = JSON.parse(raw) as unknown[];
    } catch {
      existing = [];
    }
    existing.push(record);
    await fs.writeFile(contactFile, JSON.stringify(existing, null, 2), 'utf8');
    return { success: true, message: 'Takk! Vi tar kontakt innen 1-2 virkedager.' };
  } catch {
    return { success: false, message: 'Noe gikk galt ved lagring. Prøv igjen senere.' };
  }
}
