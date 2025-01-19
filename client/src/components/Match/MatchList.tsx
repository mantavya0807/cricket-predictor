import React from 'react';
import { motion } from 'framer-motion';
import MatchCard from './MatchCard.tsx';


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


export default MatchList;