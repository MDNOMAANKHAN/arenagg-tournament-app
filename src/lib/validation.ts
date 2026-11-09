
import { z } from 'zod';
import { MAX_TEAMS_PER_TOURNAMENT } from '@/lib/payment';

const name = z.string().trim().min(2).max(60);

const gid = z
  .string()
  .trim()
  .min(3)
  .max(40)
  .regex(
    /^[\p{L}\p{N}_#.\- ]+$/u,
    'Invalid characters in gaming ID'
  );

const contact = z
  .string()
  .trim()
  .regex(
    /^(?:\+?\d[\d\s-]{8,14}|[^\s@]+@[^\s@]+\.[^\s@]+)$/,
    'Enter a valid phone number or email'
  );

const player = z.object({
  name,
  game_id: gid,
});

export const registerSchema = z
  .object({
    tournament_id: z.string().uuid(),

    team_name: z.string().trim().min(2).max(40),

    captain_name: name,
    captain_game_id: gid,
    captain_contact: contact,

    teammates: z.array(player).max(9),

    // Substitute is optional.
    // Empty substitute fields should be sent as null.
    substitute: player.nullable(),

    website: z.string().optional(),

    t: z.number().finite().positive(),
  })
  .refine(
    (d) => {
      const ids = [
        d.captain_game_id,
        ...d.teammates.map((m) => m.game_id),
        ...(d.substitute ? [d.substitute.game_id] : []),
      ].map((s) => s.toLowerCase());

      return new Set(ids).size === ids.length;
    },
    {
      message: 'Every player needs a different gaming ID',
      path: ['teammates'],
    }
  );

const iso = z.string().datetime({ offset: true });

export const TOURNAMENT_STATUSES = [
  'draft',
  'open',
  'closed',
  'live',
  'completed',
  'cancelled',
] as const;

export const tournamentSchema = z.object({
  game_id: z.string().uuid(),
  title: z.string().trim().min(3).max(80),
  description: z.string().max(500).default(''),
  starts_at: iso,
  team_size: z.number().int().min(1).max(10),
  // The payment migration narrows tournaments_max_teams_check to 2..12.
  max_teams: z.number().int().min(2).max(MAX_TEAMS_PER_TOURNAMENT),
  entry_fee: z.number().int().min(0).max(100000).default(100),
  rules: z.string().max(5000).default(''),
  status: z.enum(TOURNAMENT_STATUSES),
});
export const matchSchema = z.object({
  tournament_id: z.string().uuid(),
  round_label: z.string().trim().min(1).max(60),
  match_no: z.number().int().min(1),
  scheduled_at: iso.nullable().optional(),
  status: z.enum(['scheduled', 'live', 'completed', 'cancelled']),
});

export const resultSchema = z.object({
  tournament_id: z.string().uuid(),
  registration_id: z.string().uuid(),
  placement: z.number().int().min(1),
  points: z.number().int().min(0).default(0),
  kills: z.number().int().min(0).default(0),
  published: z.boolean().default(false),
});

export const regStatusSchema = z
  .object({
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    payment_status: z.enum(['pending', 'paid', 'rejected']).optional(),
  })
  .refine((d) => d.status !== undefined || d.payment_status !== undefined, {
    message: 'Nothing to update',
  });
