// src/constants/squadConstants.ts
import { 
    GanttChartSquare, 
    Target, 
    Shield, 
    User 
  } from 'lucide-react';
  
  export const PLAYER_ROLES = {
    BATSMAN: 'Batsman',
    BOWLER: 'Bowler',
    ALL_ROUNDER: 'All-Rounder',
    WICKET_KEEPER: 'Wicket Keeper'
  } as const;
  
  export const ROLE_COLORS = {
    [PLAYER_ROLES.BATSMAN]: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      border: 'border-blue-500/50'
    },
    [PLAYER_ROLES.BOWLER]: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/50'
    },
    [PLAYER_ROLES.ALL_ROUNDER]: {
      bg: 'bg-purple-500/20',
      text: 'text-purple-400',
      border: 'border-purple-500/50'
    },
    [PLAYER_ROLES.WICKET_KEEPER]: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/50'
    }
  } as const;
  
  export const TEAM_THEMES = {
    team1: {
      bg: 'bg-blue-500/10',
      bgHover: 'hover:bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      textHover: 'group-hover:text-blue-400'
    },
    team2: {
      bg: 'bg-red-500/10',
      bgHover: 'hover:bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      textHover: 'group-hover:text-red-400'
    }
  } as const;