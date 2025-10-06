import { http, HttpResponse } from 'msw';
import type { Challenge, LeaderboardRow } from '../types/challenge';

type Db = {
  challenges: Challenge[];
  leaderboardByChallenge: Record<string, LeaderboardRow[]>;
};

const now = new Date();
function iso(date: Date) {
  return date.toISOString();
}

const seedChallenges = (): Db => {
  const base: Challenge[] = [
    {
      id: 'c1',
      title: 'Plant 100 Trees',
      description: 'Join the community to plant trees in local parks.',
      goalType: 'trees',
      goalValue: 100,
      startDate: iso(new Date(now.getTime() - 5 * 86400000)),
      endDate: iso(new Date(now.getTime() + 20 * 86400000)),
      badgeUrl: undefined,
      createdBy: 'community',
      joined: true,
      progress: 0.42,
      userContribution: 12,
      participants: 238,
      difficulty: 'medium',
    },
    {
      id: 'c2',
      title: 'Watering Week',
      description: 'Water saplings every day for a week.',
      goalType: 'watering',
      goalValue: 7,
      startDate: iso(new Date(now.getTime() - 2 * 86400000)),
      endDate: iso(new Date(now.getTime() + 5 * 86400000)),
      createdBy: 'ngo',
      joined: false,
      progress: 0.18,
      userContribution: 1,
      participants: 121,
      difficulty: 'easy',
    },
    {
      id: 'c3',
      title: '30-Day Forest Streak',
      description: 'Be active for 30 days to earn a badge.',
      goalType: 'daysActive',
      goalValue: 30,
      startDate: iso(new Date(now.getTime() - 10 * 86400000)),
      endDate: iso(new Date(now.getTime() + 30 * 86400000)),
      createdBy: 'user',
      joined: false,
      progress: 0.33,
      userContribution: 10,
      participants: 87,
      difficulty: 'hard',
    },
    {
      id: 'c4',
      title: 'Community Grove',
      description: 'Create a grove by planting trees together.',
      goalType: 'trees',
      goalValue: 300,
      startDate: iso(new Date(now.getTime() + 2 * 86400000)),
      endDate: iso(new Date(now.getTime() + 40 * 86400000)),
      createdBy: 'community',
      joined: false,
      progress: 0,
      userContribution: 0,
      participants: 45,
      difficulty: 'medium',
    },
    {
      id: 'c5',
      title: 'Riverbank Restoration',
      description: 'Plant along riverbanks to prevent erosion.',
      goalType: 'trees',
      goalValue: 200,
      startDate: iso(new Date(now.getTime() - 20 * 86400000)),
      endDate: iso(new Date(now.getTime() - 1 * 86400000)),
      createdBy: 'ngo',
      joined: true,
      progress: 1,
      userContribution: 50,
      participants: 512,
      difficulty: 'hard',
    },
    {
      id: 'c6',
      title: 'Urban Courtyard Planting',
      description: 'Greening courtyards with drought-resistant species.',
      goalType: 'trees',
      goalValue: 80,
      startDate: iso(new Date(now.getTime() - 1 * 86400000)),
      endDate: iso(new Date(now.getTime() + 10 * 86400000)),
      createdBy: 'community',
      joined: false,
      progress: 0.12,
      userContribution: 3,
      participants: 61,
      difficulty: 'easy',
    },
    {
      id: 'c7',
      title: 'Schoolyard Shade',
      description: 'Plant shade trees at schools.',
      goalType: 'trees',
      goalValue: 120,
      startDate: iso(new Date(now.getTime() + 5 * 86400000)),
      endDate: iso(new Date(now.getTime() + 25 * 86400000)),
      createdBy: 'ngo',
      joined: false,
      progress: 0,
      userContribution: 0,
      participants: 33,
      difficulty: 'medium',
    },
    {
      id: 'c8',
      title: 'Neighborhood Water Watch',
      description: 'Keep young trees watered during heatwave.',
      goalType: 'watering',
      goalValue: 20,
      startDate: iso(new Date(now.getTime() - 3 * 86400000)),
      endDate: iso(new Date(now.getTime() + 12 * 86400000)),
      createdBy: 'community',
      joined: false,
      progress: 0.25,
      userContribution: 4,
      participants: 98,
      difficulty: 'medium',
    },
  ];

  const leaderboardByChallenge: Record<string, LeaderboardRow[]> = {};
  for (const c of base) {
    const rows: LeaderboardRow[] = Array.from({ length: 20 }).map((_, i) => ({
      userId: `${c.id}-u${i + 1}`,
      name: `User ${i + 1}`,
      avatar: undefined,
      value: Math.max(0, Math.round((c.goalValue * Math.random()) / 2)),
      rank: i + 1,
    })).sort((a, b) => b.value - a.value)
      .map((r, idx) => ({ ...r, rank: idx + 1 }));
    leaderboardByChallenge[c.id] = rows;
  }

  return { challenges: base, leaderboardByChallenge };
};

const db: Db = seedChallenges();

function recalcProgress(challenge: Challenge, leaderboard: LeaderboardRow[]) {
  const total = leaderboard.reduce((sum, r) => sum + r.value, 0);
  const progress = Math.min(1, total / challenge.goalValue);
  challenge.progress = progress;
  // recompute participants
  challenge.participants = leaderboard.length;
}

export const handlers = [
  http.get('/api/challenges', () => {
    return HttpResponse.json(db.challenges);
  }),

  http.get('/api/challenges/:id', ({ params }) => {
    const id = params.id as string;
    const found = db.challenges.find((c) => c.id === id);
    if (!found) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(found);
  }),

  http.post('/api/challenges/:id/join', ({ params }) => {
    const id = params.id as string;
    const found = db.challenges.find((c) => c.id === id);
    if (!found) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    found.joined = true;
    // add a new row for the current user if not exists
    const board = db.leaderboardByChallenge[id] || (db.leaderboardByChallenge[id] = []);
    if (!board.some((r) => r.userId === 'me')) {
      board.push({ userId: 'me', name: 'You', value: 0, rank: board.length + 1 });
    }
    board.sort((a, b) => b.value - a.value).forEach((r, i) => (r.rank = i + 1));
    recalcProgress(found, board);
    return HttpResponse.json(found);
  }),

  http.post('/api/challenges/:id/progress', async ({ request, params }) => {
    const id = params.id as string;
    const body = (await request.json()) as { delta: number };
    const found = db.challenges.find((c) => c.id === id);
    if (!found) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const board = db.leaderboardByChallenge[id] || (db.leaderboardByChallenge[id] = []);
    let me = board.find((r) => r.userId === 'me');
    if (!me) {
      me = { userId: 'me', name: 'You', value: 0, rank: board.length + 1 };
      board.push(me);
    }
    me.value = Math.max(0, me.value + (body?.delta ?? 0));
    found.userContribution = me.value;
    board.sort((a, b) => b.value - a.value).forEach((r, i) => (r.rank = i + 1));
    recalcProgress(found, board);
    return HttpResponse.json({ challenge: found, leaderboard: board });
  }),

  http.get('/api/challenges/:id/leaderboard', ({ params }) => {
    const id = params.id as string;
    const board = db.leaderboardByChallenge[id] || [];
    return HttpResponse.json(board);
  }),

  http.get('/api/recommendations', () => {
    const joinable = db.challenges.filter((c) => !c.joined);
    // heuristic: pick top 3 by participants and ending soon
    const soon = joinable
      .slice()
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
    const pop = joinable.slice().sort((a, b) => b.participants - a.participants);
    const set = new Map<string, Challenge>();
    for (const c of [...soon, ...pop]) {
      if (!set.has(c.id)) set.set(c.id, c);
      if (set.size >= 3) break;
    }
    return HttpResponse.json(Array.from(set.values()));
  }),
];


