export type Challenge = {
  id: string;
  title: string;
  description: string;
  goalType: 'trees' | 'watering' | 'daysActive';
  goalValue: number;
  startDate: string; // ISO
  endDate: string; // ISO
  badgeUrl?: string;
  createdBy: 'community' | 'ngo' | 'user';
  joined: boolean;
  progress: number; // 0..1
  userContribution: number;
  participants: number;
  difficulty: 'easy' | 'medium' | 'hard';
};

export type LeaderboardRow = {
  userId: string;
  name: string;
  avatar?: string;
  value: number;
  rank: number;
};


