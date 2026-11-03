import 'server-only';
import { createClient } from '@supabase/supabase-js';
// Service-role client: bypasses RLS. Use only in trusted server code; never import into client components or expose its key.
export const supabaseService = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
