export interface Venue {
  name: string;
  city: string;
  country?: string;
}

export interface Score {
  runs: number;
  wickets: number;
  overs: number;
  declared: boolean;
}

export interface Match {
  matchId: string;
  seriesName: string;
  matchType: string;
  team1: string;
  team2: string;
  venue: Venue;
  currentScore: {
    team1Score: Score | null;
    team2Score: Score | null;
    battingTeam: string;
    currentState: string;
  };
  status: 'LIVE' | 'UPCOMING' | 'COMPLETED';
  result?: string;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
}