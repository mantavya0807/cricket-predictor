export interface Match {
    matchId: string;
    seriesName: string;
    matchType: 'TEST' | 'ODI' | 'T20' | 'OTHER';
    team1: string;
    team2: string;
    venue: {
      name: string;
      city: string;
      country: string;
    };
    currentScore?: {
      team1Score: Score;
      team2Score: Score;
      battingTeam: string;
      currentState: string;
    };
    status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
    result?: string;
    lastUpdated: Date;
  }
  
  interface Score {
    runs: number;
    wickets: number;
    overs: number;
    declared: boolean;
  }