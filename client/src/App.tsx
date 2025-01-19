import { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate,
  useParams 
} from 'react-router-dom';
import { Match } from './types/match';
import { MatchService, handleApiError } from './services/api.ts';

// Components
import Navbar from './components/Navbar/Navbar.tsx';
import Welcome from './components/Welcome/Welcome.tsx';
import MatchList from './components/Match/MatchList.tsx';
import SquadView from './components/SquadView/index.tsx';

// Context for match data
import { createContext } from 'react';

interface MatchContextType {
  liveMatches: Match[];
  upcomingMatches: Match[];
  isLoading: boolean;
  error: string | null;
  selectedMatch: Match | null;
  setSelectedMatch: (match: Match | null) => void;
}

export const MatchContext = createContext<MatchContextType>({
  liveMatches: [],
  upcomingMatches: [],
  isLoading: false,
  error: null,
  selectedMatch: null,
  setSelectedMatch: () => {},
});

// Squad View Route Component
const SquadViewRoute = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [squadData, setSquadData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSquadData = async () => {
      try {
        setIsLoading(true);
        const data = await MatchService.getMatchSquad(matchId!);
        setSquadData(data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (matchId) {
      fetchSquadData();
    }
  }, [matchId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-light"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-red-500 text-white px-6 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return squadData && (
    <SquadView 
      squadData={squadData} 
      onClose={() => navigate(-1)} 
    />
  );
};

const AppContent = () => {
  const navigate = useNavigate();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

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

  const handleTypeChange = (type: 'live' | 'upcoming') => {
    navigate(`/${type}`);
  };

  const contextValue = {
    liveMatches,
    upcomingMatches,
    isLoading,
    error,
    selectedMatch,
    setSelectedMatch
  };

  return (
    <MatchContext.Provider value={contextValue}>
      <div className="min-h-screen bg-primary-dark">
        <Navbar onTypeChange={handleTypeChange} />
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
          <Route path="/match/:matchId/squad" element={<SquadViewRoute />} />
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
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;