import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdmin } from '@/lib/auth';

const csvCell = (value: unknown) => {
  let text = String(value ?? '');
  // Prevent spreadsheet formula injection when admins open the export in Excel/Sheets.
  if (/^[\s]*[=+@\-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export async function GET(_req: NextRequest, context: { params: { id: string } }) {
  if (!z.string().uuid().safeParse(context.params.id).success) {
    return NextResponse.json({ error: 'Invalid tournament ID.' }, { status: 400 });
  }
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { data, error } = await admin.sb
    .from('registrations')
    .select('reg_code,team_name,captain_name,captain_contact,status,created_at,registration_members(name,gaming_id,role)')
    .eq('tournament_id', context.params.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Registration CSV export failed', error.message);
    return NextResponse.json({ error: 'Could not export registrations.' }, { status: 500 });
  }

  const header = ['Registration ID', 'Team', 'Captain', 'Contact', 'Status', 'Registered At', 'Players'];
  const lines = (data ?? []).map((r: any) => [
    r.reg_code,
    r.team_name,
    r.captain_name,
    r.captain_contact,
    r.status,
    r.created_at,
    (r.registration_members ?? []).map((m: any) => `${m.name} (${m.role}): ${m.gaming_id}`).join(' | '),
  ].map(csvCell).join(','));
  const csv = '\uFEFF' + [header.map(csvCell).join(','), ...lines].join('\r\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="arenagg-${context.params.id}-registrations.csv"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
