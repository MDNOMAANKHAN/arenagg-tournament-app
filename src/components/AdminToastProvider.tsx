'use client';

import { useEffect, useState } from 'react';

type ToastMessage = { id: number; message: string; type: 'success' | 'error' | 'info' };

export function notifyAdmin(message: string, type: ToastMessage['type'] = 'success') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('arenagg:toast', { detail: { message, type } }));
}

export default function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string; type?: ToastMessage['type'] }>).detail;
      if (!detail?.message) return;
      setToast({ id: Date.now(), message: detail.message, type: detail.type ?? 'success' });
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setToast(null), 3600);
    };
    window.addEventListener('arenagg:toast', onToast);
    return () => {
      window.removeEventListener('arenagg:toast', onToast);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {children}
      {toast && (
        <div className="pointer-events-none fixed right-4 top-4 z-[100] w-[min( calc(100vw - 2rem), 380px)]" aria-live="polite" aria-atomic="true">
          <div key={toast.id} className={`arena-toast-drop flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
            toast.type === 'error'
              ? 'border-red-400/30 bg-[#24121a]/95 text-red-200'
              : toast.type === 'info'
                ? 'border-cyan-400/30 bg-[#0b1c30]/95 text-cyan-100'
                : 'border-emerald-400/30 bg-[#0d241f]/95 text-emerald-100'
          }`}>
            <span className="mt-0.5 text-sm font-black" aria-hidden="true">{toast.type === 'error' ? '!' : toast.type === 'info' ? 'i' : '✓'}</span>
            <p className="text-sm font-semibold leading-5">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
}
