'use client';

import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function isStandalone() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export default function PWAFeatures() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setInstalled(isStandalone());

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        setMessage('App installation is temporarily unavailable. Please try again later.');
      });
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      setShowHelp(false);
      setMessage('');
    };

    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
      setShowHelp(false);
      setMessage('');
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    setMessage('');

    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    if (!installEvent) {
      setShowHelp(true);
      return;
    }

    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      setInstallEvent(null);

      if (choice.outcome === 'accepted') {
        setMessage('ARENAGG installation requested. Follow the Android confirmation to finish installing.');
      } else {
        setMessage('Installation was cancelled. You can try again whenever you are ready.');
      }
    } catch {
      setInstallEvent(null);
      setMessage('Android did not open the app installer. Please reload ARENAGG and try again.');
    }
  }

  if (installed) {
    return (
      <span className="inline-flex min-h-10 items-center rounded-xl border border-emerald-300/20 bg-emerald-400/[0.06] px-3 text-xs font-bold text-emerald-200">
        ✓ ARENAGG app installed
      </span>
    );
  }

  const isAppleMobile =
    typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);

  return (
    <>
      <button
        type="button"
        onClick={install}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 px-3.5 text-xs font-extrabold text-cyan-100 shadow-[0_0_18px_rgba(69,215,255,0.08)] transition hover:border-cyan-200/50 hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-70"
        aria-label="Install ARENAGG as an app"
      >
        <span aria-hidden="true">⬇</span>Install ARENAGG
      </button>

      {message && <p className="mt-2 text-xs text-cyan-200" role="status">{message}</p>}

      {showHelp && (
        <div
          className="fixed inset-x-3 bottom-4 z-[100] mx-auto max-w-sm rounded-2xl border border-cyan-300/20 bg-[#0b1729]/95 p-3.5 text-sm text-white shadow-2xl backdrop-blur-xl"
          role="dialog"
          aria-label="Native app installation help"
        >
          <button
            type="button"
            onClick={() => setShowHelp(false)}
            className="float-right ml-3 rounded-lg px-2 py-1 text-slate-300"
            aria-label="Close installation help"
          >
            ✕
          </button>
          <p className="font-black text-cyan-200">Install the ARENAGG app</p>
          <p className="mt-1.5 text-xs leading-5 text-slate-300">
            {isAppleMobile
              ? 'On iPhone or iPad, open ARENAGG in Safari and use Share → Add to Home Screen. iOS uses its own web-app installation flow.'
              : 'Your browser has not offered Android’s native “Install app” prompt yet. We will not create a Chrome shortcut. Open arenagg.live in an up-to-date Chrome browser, keep the site online, then reload and try Install ARENAGG again. If Chrome only offers “Add to Home screen” or “Create shortcut”, cancel it — that is not the standalone app installation you requested.'}
          </p>
        </div>
      )}
    </>
  );
}
