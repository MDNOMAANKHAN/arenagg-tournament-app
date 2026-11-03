'use client';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
export default function SignOut() {
  const r = useRouter();
  return <button className="btn ghost sm" onClick={async () => { await supabaseBrowser().auth.signOut(); r.replace('/admin/login'); r.refresh(); }}>Sign out</button>;
}
