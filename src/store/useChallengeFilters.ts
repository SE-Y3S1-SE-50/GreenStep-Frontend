import { create } from 'zustand';

type SortKey = 'endingSoon' | 'popularity';
type GoalType = 'trees' | 'watering' | 'daysActive';
type Difficulty = 'easy' | 'medium' | 'hard';

type ChallengeFiltersState = {
  search: string;
  difficulty: Difficulty[];
  goalType: GoalType[];
  sort: SortKey;
  setSearch: (v: string) => void;
  toggleDifficulty: (d: Difficulty) => void;
  toggleGoalType: (g: GoalType) => void;
  setSort: (s: SortKey) => void;
  clear: () => void;
};

export const useChallengeFilters = create<ChallengeFiltersState>((set) => ({
  search: '',
  difficulty: [],
  goalType: [],
  sort: 'endingSoon',
  setSearch: (v) => set({ search: v }),
  toggleDifficulty: (d) =>
    set((s) => ({
      difficulty: s.difficulty.includes(d)
        ? s.difficulty.filter((x) => x !== d)
        : [...s.difficulty, d],
    })),
  toggleGoalType: (g) =>
    set((s) => ({
      goalType: s.goalType.includes(g)
        ? s.goalType.filter((x) => x !== g)
        : [...s.goalType, g],
    })),
  setSort: (sort) => set({ sort }),
  clear: () => set({ search: '', difficulty: [], goalType: [], sort: 'endingSoon' }),
}));


