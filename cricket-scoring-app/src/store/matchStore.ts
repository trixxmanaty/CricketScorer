import { create } from 'zustand';

export type MatchFormat = 'T20' | 'ODI' | 'First-Class';

export interface MatchDetails {
  format: MatchFormat;
  venue: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  squads: {
    [teamId: string]: string[];
  };
  tossWinner: string;
  tossChoice: 'bat' | 'bowl';
}

export type Page = 'setup' | 'scoring' | 'dashboard';

export type BallEvent = {
  runs: number;
  extraType?: 'wide' | 'no-ball' | 'leg-bye' | 'bye';
  isWicket?: boolean;
  wicketType?: string;
  batterOut?: string;
};

interface MatchStore {
  match: MatchDetails | null;
  page: Page;
  balls: BallEvent[];
  setMatch: (match: MatchDetails) => void;
  goTo: (page: Page) => void;
  addBall: (ball: BallEvent) => void;
  undoBall: () => void;
  resetInnings: () => void;
  reset: () => void;
}

export const useMatchStore = create<MatchStore>((set) => ({
  match: null,
  page: 'setup',
  balls: [],
  setMatch: (match) => set({ match, page: 'scoring', balls: [] }),
  goTo: (page) => set({ page }),
  addBall: (ball) => set((state) => ({ balls: [...state.balls, ball] })),
  undoBall: () => set((state) => ({ balls: state.balls.slice(0, -1) })),
  resetInnings: () => set({ balls: [] }),
  reset: () => set({ match: null, page: 'setup', balls: [] }),
})); 