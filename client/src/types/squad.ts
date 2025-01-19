// src/types/squad.ts
export interface Player {
  _id?: string;
  playerId: string;
  name: string;
  role?: string;
  isCaptain?: boolean;
  isWicketkeeper?: boolean;
  country?: string;
  personalInfo?: { // Made personalInfo optional
    dateOfBirth?: string;
    birthPlace?: string;
    height?: string;
    role?: string;
    battingStyle?: string;
    bowlingStyle?: string;
  };
  rankings?: {
    batting?: {
      test?: number | null;
      odi?: number | null;
      t20?: number | null;
    };
    bowling?: {
      test?: number | null;
      odi?: number | null;
      t20?: number | null;
    };
  };
  teams?: string[];
  lastUpdated?: Date;
}

export interface Team {
  name: string;
  players: Player[];
}

export interface Squad {
  team1: Team;
  team2: Team;
}