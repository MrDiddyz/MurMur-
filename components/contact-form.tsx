'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitContact } from '@/app/actions';

const initialState = { success: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-night disabled:opacity-50"
    >
      {pending ? 'Sender...' : 'Send forespørsel'}
    </button>
  );
}

export function ContactForm() {
  const [state, action] = useFormState(submitContact, initialState);

  return (
    <form action={action} className="card space-y-4">
      <input name="name" placeholder="Navn" className="w-full rounded-xl border border-white/20 bg-white/5 p-3" required />
      <input name="email" type="email" placeholder="E-post" className="w-full rounded-xl border border-white/20 bg-white/5 p-3" required />
      <textarea name="message" placeholder="Hva ønsker du å løse?" className="min-h-32 w-full rounded-xl border border-white/20 bg-white/5 p-3" required />
      <SubmitButton />
      {state.message ? (
        <p className={`text-sm ${state.success ? 'text-emerald-300' : 'text-amber-200'}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
