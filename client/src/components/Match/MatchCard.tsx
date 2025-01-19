import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MatchCardProps {
  match: {
    matchId: string;
    team1: string;
    team2: string;
    status: string;
    venue?: {
      name: string;
      city: string;
    };
    currentScore?: {
      team1Score?: {
        runs: number;
        wickets: number;
        overs: number;
      };
      team2Score?: {
        runs: number;
        wickets: number;
        overs: number;
      };
    };
    seriesName?: string;
    lastUpdated?: string;
    startTime?: string;
    gmtTime?: string;
  };
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const scoreDisplay = (score) => {
    if (!score) return '-';
    return `${score.runs}/${score.wickets} (${score.overs})`;
  };

  const handleClick = () => {
    navigate(`/match/${match.matchId}/squad`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-primary-light rounded-xl shadow-lg overflow-hidden cursor-pointer relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold group-hover:text-accent-light transition-colors">
            {match.seriesName}
          </h3>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-accent-light" />
            <span className={`px-3 py-1 rounded-full text-sm ${
              match.status === 'LIVE' 
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-600 text-gray-200'
            }`}>
              {match.status}
            </span>
          </div>
        </div>

        {/* Teams and Scores */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-white text-lg font-medium">
                {match.team1}
              </p>
              <p className="text-gray-300">
                {match.currentScore && scoreDisplay(match.currentScore.team1Score)}
              </p>
            </div>
            <div className="px-4">
              <span className="text-gray-400">vs</span>
            </div>
            <div className="flex-1 text-right">
              <p className="text-white text-lg font-medium">
                {match.team2}
              </p>
              <p className="text-gray-300">
                {match.currentScore && scoreDisplay(match.currentScore.team2Score)}
              </p>
            </div>
          </div>
        </div>

        {/* Hover Details */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t border-gray-600"
            >
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-accent-light" />
                  <span className="text-gray-400">Time:</span>{' '}
                  <span className="ml-2">{formatDate(match.startTime)}</span>
                </p>
                <p className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-accent-light" />
                  <span className="text-gray-400">Venue:</span>{' '}
                  <span className="ml-2">{match.venue?.name}, {match.venue?.city}</span>
                </p>
                {match.result && (
                  <p className="text-sm">
                    <span className="text-gray-400">Result:</span>{' '}
                    {match.result}
                  </p>
                )}
                <p className="text-sm text-accent-light mt-2">
                  Click to view squad details
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