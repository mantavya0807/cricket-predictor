// src/components/SquadView/PlayerCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  GanttChartSquare, 
  Target,
  Crown,
  Shirt,
  Medal,
  Star,
  Flag
} from 'lucide-react';
import { Player } from '../../types/squad';

interface PlayerCardProps {
  player: Player;
  onHover: (player: Player | null) => void;
  team: 'team1' | 'team2';
}

const roleColors = {
  'Batsman': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  'Bowler': 'bg-red-500/20 text-red-400 border-red-500/50',
  'All-Rounder': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  'Wicket Keeper': 'bg-green-500/20 text-green-400 border-green-500/50'
};

const teamTheme = {
  team1: {
    bg: 'hover:bg-blue-500/20',
    border: 'hover:border-blue-500/50',
    text: 'group-hover:text-blue-400',
    highlight: 'text-blue-400'
  },
  team2: {
    bg: 'hover:bg-red-500/20',
    border: 'hover:border-red-500/50',
    text: 'group-hover:text-red-400',
    highlight: 'text-red-400'
  }
};

const getBestRanking = (rankings: any) => {
  if (!rankings) return null;
  const allRankings = [
    ...Object.values(rankings.batting || {}),
    ...Object.values(rankings.bowling || {})
  ].filter(rank => rank !== null) as number[];
  
  return allRankings.length > 0 ? Math.min(...allRankings) : null;
};

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onHover, team }) => {
  const role = player.personalInfo?.role || 'Batsman';
  const roleColor = roleColors[role] || roleColors['Batsman'];
  const theme = teamTheme[team];
  const bestRanking = getBestRanking(player.rankings);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      onMouseEnter={() => onHover(player)}
      onMouseLeave={() => onHover(null)}
      className="relative group"
    >
      <motion.div 
        className={`bg-primary-light p-4 rounded-lg cursor-pointer transition-all duration-200 border border-gray-700/50 
          ${theme.bg} ${theme.border}`}
      >
        <div className="flex items-start space-x-3">
          {/* Role Icon */}
          <div className={`p-3 rounded-lg ${roleColor}`}>
            {role === 'Batsman' && <GanttChartSquare className="h-6 w-6 rotate-90" />}
            {role === 'Bowler' && <Target className="h-6 w-6" />}
            {role === 'All-Rounder' && <Shirt className="h-6 w-6" />}
            {role === 'Wicket Keeper' && <User className="h-6 w-6" />}
          </div>

          <div className="flex-1">
            {/* Name and Badges */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className={`font-medium flex items-center gap-2 ${theme.text}`}>
                  {player.name}
                  {player.isCaptain && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                  {bestRanking && bestRanking <= 10 && (
                    <Star className="h-4 w-4 text-yellow-400" />
                  )}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-sm ${theme.highlight}`}>
                    {role}
                  </span>
                  {player.isWicketkeeper && (
                    <span className="px-1.5 py-0.5 bg-primary-dark/50 text-gray-300 text-xs rounded-full">
                      WK
                    </span>
                  )}
                </div>
              </div>
              {player.country && (
                <div className="flex items-center gap-1">
                  <Flag className={`h-4 w-4 ${theme.highlight}`} />
                  <span className="text-sm text-gray-400">{player.country}</span>
                </div>
              )}
            </div>

            {/* Stats Preview */}
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                {player.personalInfo?.battingStyle && (
                  <div className="flex items-center gap-2">
                    <GanttChartSquare className="h-4 w-4 text-gray-500 rotate-90" />
                    <span>{player.personalInfo.battingStyle}</span>
                  </div>
                )}
                {player.personalInfo?.bowlingStyle && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span>{player.personalInfo.bowlingStyle}</span>
                  </div>
                )}
                {bestRanking && (
                  <div className="flex items-center gap-2">
                    <Medal className="h-4 w-4 text-yellow-500" />
                    <span>Rank #{bestRanking}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hover Indicator */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gray-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
    </motion.div>
  );
};

export default PlayerCard;