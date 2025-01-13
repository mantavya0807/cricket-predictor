import React from 'react';
import { motion } from 'framer-motion';

// Type definitions
interface Match {
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
}

interface MatchListProps {
  matches: Match[] | null;
  type: 'live' | 'upcoming';
}

const MatchList: React.FC<MatchListProps> = ({ matches, type }) => {
  const [selectedSeries, setSelectedSeries] = React.useState('All');

  // Early return for loading state
  if (!matches) {
    return (
      <div className="min-h-screen bg-primary-main py-20 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-light"></div>
      </div>
    );
  }

  // Get unique series
  const allSeries = Array.from(new Set(matches.map(m => m.seriesName || 'No Series')));
  const handleSeriesFilter = (series: string) => {
    setSelectedSeries(series);
  };

  // Filter matches by selected series
  const filteredMatches = selectedSeries === 'All'
    ? matches
    : matches.filter(m => (m.seriesName || 'No Series') === selectedSeries);

  // Group filtered matches by series
  const groupedBySeries = filteredMatches.reduce((acc: any, match) => {
    const groupKey = match.seriesName || 'No Series';
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(match);
    return acc;
  }, {});

  // Container animation config
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section className="min-h-screen bg-primary-main py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Series filter buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => handleSeriesFilter('All')}
            className={`px-4 py-2 rounded ${
              selectedSeries === 'All' ? 'bg-accent-main text-white' : 'bg-primary-light text-gray-200'
            }`}
          >
            All
          </button>
          {allSeries.map(series => (
            <button
              key={series}
              onClick={() => handleSeriesFilter(series)}
              className={`px-4 py-2 rounded ${
                selectedSeries === series ? 'bg-accent-main text-white' : 'bg-primary-light text-gray-200'
              }`}
            >
              {series}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white">
            {type === 'live' ? 'Live Matches' : 'Upcoming Matches'}
          </h2>
          <p className="text-gray-400 mt-2">
            {type === 'live' 
              ? 'Real-time cricket scores and match details'
              : 'Upcoming cricket fixtures and match schedules'
            }
          </p>
        </motion.div>

        {Object.keys(groupedBySeries).length > 0 ? (
          Object.entries(groupedBySeries).map(([series, seriesMatches]: [string, Match[]]) => (
            <div key={series} className="mb-10">
              <h3 className="text-xl font-semibold text-gray-300 mb-4">{series}</h3>
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {seriesMatches.map((match) => (
                  <MatchCard key={match.matchId} match={match} />
                ))}
              </motion.div>
            </div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-gray-400 text-xl">
              No {type} matches at the moment
            </div>
            <p className="text-gray-500 mt-2">
              Check back later for updates
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

// Match Card subcomponent
const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const scoreDisplay = (score: Match['currentScore']['team1Score']) => {
    if (!score) return '-';
    return `${score.runs}/${score.wickets} (${score.overs})`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-primary-light rounded-xl shadow-lg overflow-hidden cursor-pointer p-6"
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">{match.seriesName || 'Cricket Match'}</h3>
        <span className={`px-3 py-1 rounded-full text-sm ${
          match.status === 'LIVE' 
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-gray-600 text-gray-200'
        }`}>
          {match.status}
        </span>
      </div>

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

      {isExpanded && match.venue && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 pt-4 border-t border-gray-600"
        >
          <div className="text-gray-300">
            <p>
              <span className="text-gray-400">Venue:</span>{' '}
              {match.venue.name}, {match.venue.city}
            </p>
            {match.lastUpdated && (
              <p className="text-sm text-gray-400 mt-2">
                Last Updated: {new Date(match.lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MatchList;