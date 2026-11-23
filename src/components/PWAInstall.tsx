'use client';

import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export default function PWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Installability should still work even if offline caching is unavailable.
      });
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    const onInstalled = () => setInstallPrompt(null);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') setInstallPrompt(null);
      return;
    }
    setShowHelp((value) => !value);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={install}
        className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-400/[0.07] px-3 text-xs font-extrabold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/15 sm:px-4 sm:text-sm"
        aria-expanded={showHelp}
      >
        <span aria-hidden="true">⬇</span>
        Install app
      </button>
      {showHelp && (
        <div className="absolute right-0 z-50 mt-2 w-[min(290px,calc(100vw-2rem))] rounded-2xl border border-cyan-300/20 bg-[#0b1628] p-4 text-xs leading-6 text-slate-300 shadow-2xl">
          <p className="font-extrabold text-white">Add ARENAGG to your phone</p>
          <p className="mt-2"><b>Android / Chrome:</b> open browser menu (⋮), then choose “Install app” or “Add to Home screen”.</p>
          <p className="mt-2"><b>iPhone / Safari:</b> tap Share, then “Add to Home Screen”.</p>
          <button type="button" onClick={() => setShowHelp(false)} className="mt-2 font-bold text-cyan-300">Got it</button>
        </div>
      )}
    </div>
  );
}
