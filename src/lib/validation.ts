
import { z } from 'zod';

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

export const tournamentSchema = z.object({
  game_id: z.string().uuid(),
  title: z.string().trim().min(3).max(80),
  description: z.string().max(500).default(''),
  starts_at: iso,
  team_size: z.number().int().min(1).max(10),
  max_teams: z.number().int().min(2).max(500),
  rules: z.string().max(5000).default(''),
  status: z.enum(['draft', 'open', 'closed', 'live', 'completed']),
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

export const regStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});
