// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Match } from './types/match';
import { MatchService, handleApiError } from './services/api.ts';

// Components
import Navbar from './components/Navbar/Navbar.tsx';
import Welcome from './components/Welcome/Welcome.tsx';
import MatchList from './components/Match/MatchList.tsx';

// Context for match data (if needed)
import { createContext } from 'react';
export const MatchContext = createContext<{
  liveMatches: Match[];
  upcomingMatches: Match[];
  isLoading: boolean;
  error: string | null;
}>({
  liveMatches: [],
  upcomingMatches: [],
  isLoading: false,
  error: null,
});

const App = () => {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [live, upcoming] = await Promise.all([
        MatchService.getLiveMatches(),
        MatchService.getUpcomingMatches()
      ]);
      setLiveMatches(live);
      setUpcomingMatches(upcoming);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();

    // Set up polling for live matches
    const pollInterval = setInterval(fetchMatches, 30000); // Poll every 30 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(pollInterval);
      setLiveMatches([]);
      setUpcomingMatches([]);
    };
  }, []);

  return (
    <Router>
      <MatchContext.Provider value={{ liveMatches, upcomingMatches, isLoading, error }}>
        <div className="min-h-screen bg-primary-dark">
          <Navbar />
          <Routes>
            <Route path="/" element={
              <>
                <Welcome />
                <MatchList matches={liveMatches} type="live" />
              </>
            } />
            <Route path="/live" element={
              <MatchList matches={liveMatches} type="live" />
            } />
            <Route path="/upcoming" element={
              <MatchList matches={upcomingMatches} type="upcoming" />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Error Toast */}
          {error && (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
              {error}
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-light"></div>
            </div>
          )}
        </div>
      </MatchContext.Provider>
    </Router>
  );
};

export default App;