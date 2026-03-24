'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function InstallButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  if (!installEvent) {
    return null;
  }

  return (
    <button
      type="button"
      className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100"
      onClick={async () => {
        try {
          await installEvent.prompt();
          const result = await installEvent.userChoice;
          
          if (result.outcome === 'dismissed') {
            // User dismissed the install prompt
            console.log('Install prompt dismissed');
          } else if (result.outcome === 'accepted') {
            // User accepted the install prompt
            console.log('Install prompt accepted');
          }
        } catch (error) {
          // Handle errors (e.g., stale event, permission denied)
          console.error('Install prompt error:', error);
        } finally {
          // Clear the stale event after use
          setInstallEvent(null);
        }
      }}
    >
      Install app
    </button>
  );
}
