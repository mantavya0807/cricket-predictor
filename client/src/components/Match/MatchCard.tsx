// src/components/Match/MatchCard.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Match } from '../../types/match';

interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const scoreDisplay = (score: any) => {
    if (!score) return '-';
    return `${score.runs}/${score.wickets} (${score.overs})`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-primary-light rounded-xl shadow-lg overflow-hidden cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-6">
        {/* Series Info */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">{match.seriesName}</h3>
          <span className={`px-3 py-1 rounded-full text-sm ${
            match.status === 'LIVE' 
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gray-600 text-gray-200'
          }`}>
            {match.status}
          </span>
        </div>

        {/* Teams and Scores */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-white text-lg font-medium">{match.team1}</p>
              <p className="text-gray-300">
                {match.currentScore && scoreDisplay(match.currentScore.team1Score)}
              </p>
            </div>
            <div className="px-4">
              <span className="text-gray-400">vs</span>
            </div>
            <div className="flex-1 text-right">
              <p className="text-white text-lg font-medium">{match.team2}</p>
              <p className="text-gray-300">
                {match.currentScore && scoreDisplay(match.currentScore.team2Score)}
              </p>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-600"
            >
              <div className="space-y-2 text-gray-300">
                <p>
                  <span className="text-gray-400">Venue:</span>{' '}
                  {match.venue.name}, {match.venue.city}
                </p>
                {match.result && (
                  <p>
                    <span className="text-gray-400">Result:</span>{' '}
                    {match.result}
                  </p>
                )}
                {match.currentScore?.battingTeam && (
                  <p>
                    <span className="text-gray-400">Batting:</span>{' '}
                    {match.currentScore.battingTeam}
                  </p>
                )}
                <p className="text-sm text-gray-400">
                  Last Updated: {new Date(match.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MatchCard;