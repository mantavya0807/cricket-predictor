import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ChevronDown, 
  Filter,  
  Target, 
  Shield, 
  HandMetal 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Squad, Player } from '../../types/squad';
import PlayerCard from './PlayerCard.tsx';
import PlayerStats from './PlayerStats.tsx';

interface SquadViewProps {
  squadData: Squad;
}

type PlayerRole = 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket Keeper';

const roleColors: Record<PlayerRole, string> = {
  'Batsman': 'bg-blue-500/20 text-blue-400',
  'Bowler': 'bg-red-500/20 text-red-400',
  'All-Rounder': 'bg-purple-500/20 text-purple-400',
  'Wicket Keeper': 'bg-green-500/20 text-green-400'
};

const roleIcons: Record<PlayerRole, JSX.Element> = {
  'Batsman': <Target className="h-4 w-4" />,
  'Bowler': <Target className="h-4 w-4" />,
  'All-Rounder': <Shield className="h-4 w-4" />,
  'Wicket Keeper': <HandMetal className="h-4 w-4" />
};

const SquadView: React.FC<SquadViewProps> = ({ squadData }) => {
  const navigate = useNavigate();
  const [hoveredPlayer, setHoveredPlayer] = useState<Player | null>(null);
  const [selectedRole, setSelectedRole] = useState<PlayerRole | 'All'>('All');
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | 'both'>('both');

  const playerRoles: PlayerRole[] = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket Keeper'];

  const teamColors = {
    team1: 'border-blue-500/50 bg-blue-500/10',
    team2: 'border-red-500/50 bg-red-500/10'
  };

  // Group players by role for each team
  const groupedPlayers = useMemo(() => {
    const groupByRole = (players: Player[]) => {
      const grouped: Record<PlayerRole, Player[]> = {
        'Batsman': [],
        'Bowler': [],
        'All-Rounder': [],
        'Wicket Keeper': []
      };

      players.forEach(player => {
        const role = player.personalInfo?.role as PlayerRole || 'Batsman';
        if (role in grouped) {
          grouped[role].push(player);
        }
      });

      return grouped;
    };

    return {
      team1: groupByRole(squadData.team1.players),
      team2: groupByRole(squadData.team2.players)
    };
  }, [squadData]);

  const filteredPlayers = (teamPlayers: Record<PlayerRole, Player[]>) => {
    if (selectedRole === 'All') {
      return Object.values(teamPlayers).flat();
    }
    return teamPlayers[selectedRole] || [];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50"
      onClick={() => navigate(-1)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-primary-dark rounded-xl max-w-[95vw] w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700/50"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-primary-dark/95 backdrop-blur-sm p-6 border-b border-gray-700 z-20">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <Users className="h-7 w-7 mr-3 text-accent-light" />
                Match Squads
              </h2>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-primary-light rounded-full"
              >
                <ChevronDown className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-6">
              {/* Team Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTeam('both')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedTeam === 'both' 
                      ? 'bg-accent-light text-white' 
                      : 'bg-primary-light text-gray-400 hover:text-white'
                  }`}
                >
                  Both Teams
                </button>
                <button
                  onClick={() => setSelectedTeam('team1')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedTeam === 'team1' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-blue-500/20 text-blue-400 hover:text-white'
                  }`}
                >
                  {squadData.team1.name}
                </button>
                <button
                  onClick={() => setSelectedTeam('team2')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedTeam === 'team2' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-red-500/20 text-red-400 hover:text-white'
                  }`}
                >
                  {squadData.team2.name}
                </button>
              </div>

              {/* Role Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedRole('All')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedRole === 'All' 
                      ? 'bg-accent-light text-white' 
                      : 'bg-primary-light text-gray-400 hover:text-white'
                  }`}
                >
                  All Roles
                </button>
                {playerRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      selectedRole === role 
                        ? roleColors[role].replace('/20', '')
                        : `${roleColors[role]} opacity-75 hover:opacity-100`
                    }`}
                  >
                    {roleIcons[role]}
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-2 gap-8 p-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
          {/* Team 1 */}
          {(selectedTeam === 'both' || selectedTeam === 'team1') && (
            <div className={`space-y-6 p-6 rounded-xl border ${teamColors.team1}`}>
              <motion.h3 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-semibold text-blue-400 flex items-center"
              >
                <Users className="h-6 w-6 mr-3" />
                {squadData.team1.name}
              </motion.h3>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                {filteredPlayers(groupedPlayers.team1).map((player, index) => (
                  <PlayerCard 
                    key={player._id || index} 
                    player={player} 
                    onHover={setHoveredPlayer}
                    team="team1"
                  />
                ))}
              </motion.div>
            </div>
          )}

          {/* Team 2 */}
          {(selectedTeam === 'both' || selectedTeam === 'team2') && (
            <div className={`space-y-6 p-6 rounded-xl border ${teamColors.team2}`}>
              <motion.h3 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-semibold text-red-400 flex items-center"
              >
                <Users className="h-6 w-6 mr-3" />
                {squadData.team2.name}
              </motion.h3>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                {filteredPlayers(groupedPlayers.team2).map((player, index) => (
                  <PlayerCard 
                    key={player._id || index} 
                    player={player} 
                    onHover={setHoveredPlayer}
                    team="team2"
                  />
                ))}
              </motion.div>
            </div>
          )}
        </div>

        {/* Player Stats Modal */}
        <AnimatePresence>
          {hoveredPlayer && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30"
              onMouseLeave={() => setHoveredPlayer(null)}
            >
              <PlayerStats 
                stats={hoveredPlayer} 
                onClose={() => setHoveredPlayer(null)} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default SquadView;