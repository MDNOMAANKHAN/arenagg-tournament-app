
import Link from 'next/link';
import { fmt, gameColor, slotInfo, type PublicTournament } from '@/lib/format';

export default function TournamentCard({
  t,
  i,
}: {
  t: PublicTournament;
  i: number;
}) {
  const s = slotInfo(t);
  const c = gameColor(t.game_slug);

  const registered = t.registered ?? 0;
  const maxTeams = t.max_teams ?? 12;
  const isFull = registered >= maxTeams;

  return (
    <article
      className="card hv rise flex flex-col gap-3.5"
      style={{ '--i': i } as React.CSSProperties}
    >
      <div className="h-1 rounded-full" style={{ background: c }} />

      <div className="flex items-center justify-between">
        <span
          className="text-xs font-bold tracking-wider"
          style={{ color: c }}
        >
          {t.game_name.toUpperCase()}
        </span>

        <span
          className={`st ${
            s.canRegister ? 'ok' : t.status === 'live' ? 'info' : 'gray'
          }`}
        >
          {s.label}
        </span>
      </div>

      <div>
        <h3 className="text-[22px]">{t.title}</h3>
        <div className="mt-1 text-[13px] text-muted">
          {t.team_size === 1 ? 'Solo' : `Squad of ${t.team_size}`} ·{' '}
          {fmt(t.starts_at)}
        </div>
      </div>

      {/* Registered teams */}
      <div>
        <div className="mb-2 flex justify-between text-xs text-muted">
          <span className="font-bold text-ink">
            {isFull
              ? 'Filled'
              : `${registered} / ${maxTeams} teams registered`}
          </span>

          <span>
            {isFull ? '0 slots left' : `${maxTeams - registered} slots left`}
          </span>
        </div>

        <div className="bar">
          <i style={{ width: `${s.pct}%` }} />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-auto flex gap-2">
        {s.canRegister && (
          <Link href={`/register/${t.id}`} className="btn flex-1">
            Register now →
          </Link>
        )}

        <Link
          href={`/tournaments/${t.id}`}
          className={`btn light ${s.canRegister ? '' : 'flex-1'}`}
        >
          Details &amp; rules
        </Link>
      </div>
    </article>
  );
}
