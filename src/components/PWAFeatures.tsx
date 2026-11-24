'use client';

import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function isStandalone() {
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
        // Manual installation guidance remains available if registration fails.
      });
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      setShowHelp(false);
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
      // Always keep a reinstall path visible after users remove the app.
      setShowHelp(true);
      return;
    }

    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      setInstallEvent(null);

      if (choice.outcome === 'accepted') {
        setMessage('Installation started. If the app does not appear, use your browser menu to install it.');
      } else {
        setShowHelp(true);
      }
    } catch {
      setInstallEvent(null);
      setShowHelp(true);
    }
  }

  if (installed) {
    return (
      <span className="inline-flex min-h-10 items-center rounded-xl border border-emerald-300/20 bg-emerald-400/[0.06] px-3 text-xs font-bold text-emerald-200">
        ✓ App installed
      </span>
    );
  }

  const isAppleMobile = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);

  return (
    <>
      <button
        type="button"
        onClick={install}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 px-3.5 text-xs font-extrabold text-cyan-100 shadow-[0_0_18px_rgba(69,215,255,0.08)] transition hover:border-cyan-200/50 hover:bg-cyan-300/20"
        aria-label="Install ARENAGG app"
      >
        <span aria-hidden="true">⬇</span>Install App
      </button>

      {message && <p className="mt-2 text-xs text-cyan-200" role="status">{message}</p>}

      {showHelp && (
        <div
          className="fixed inset-x-3 bottom-4 z-[100] mx-auto max-w-sm rounded-2xl border border-cyan-300/20 bg-[#0b1729]/95 p-3.5 text-sm text-white shadow-2xl backdrop-blur-xl"
          role="dialog"
          aria-label="Install ARENAGG instructions"
        >
          <button
            type="button"
            onClick={() => setShowHelp(false)}
            className="float-right ml-3 rounded-lg px-2 py-1 text-slate-300"
            aria-label="Close install instructions"
          >
            ✕
          </button>
          <p className="font-black text-cyan-200">Install or reinstall ARENAGG</p>
          <p className="mt-1.5 text-xs leading-5 text-slate-300">
            {isAppleMobile
              ? 'Open this website in Safari. Tap Share → Add to Home Screen → Add.'
              : 'Open this website directly in Chrome. Tap ⋮ → Install app. If you see “Add to Home screen” instead, choose it and enable “Install” or “Create shortcut” if offered.'}
          </p>
          {!isAppleMobile && (
            <p className="mt-1.5 text-xs leading-5 text-slate-400">
              If the install option is missing after uninstalling, open Chrome Settings → Site settings → Storage, clear ARENAGG site data, close Chrome fully, then reopen arenagg.live and try again.
            </p>
          )}
        </div>
      )}
    </>
  );
}
