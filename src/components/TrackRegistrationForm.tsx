'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackRegistrationForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = code.trim().toUpperCase();
    if (!/^AGG-[0-9A-F]{20}$/.test(value)) {
      setError('Enter the full registration ID (AGG- followed by 20 letters/numbers).');
      return;
    }
    setError('');
    router.push('/registration/' + value);
  }

  return (
    <form onSubmit={submit} className="mt-7 grid gap-4">
      <label htmlFor="registration-code" className="text-sm font-bold text-slate-200">Registration ID</label>
      <input
        id="registration-code"
        value={code}
        onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
        placeholder="AGG-XXXXXXXXXXXXXXXXXXXX"
        autoCapitalize="characters"
        autoComplete="off"
        inputMode="text"
        maxLength={24}
        required
        className="input w-full font-mono tracking-wider"
      />
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      <button type="submit" className="arena-glass-button w-full justify-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white">Check my status →</button>
    </form>
  );
}
