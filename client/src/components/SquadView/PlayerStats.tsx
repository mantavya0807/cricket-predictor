import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  User, 
  GanttChartSquare,
  Award,
  ChevronDown,
  Trophy,
  Flag,
  Target
} from 'lucide-react';
import { Player } from '../../types/squad';

interface PlayerStatsProps {
  stats: Player;
  onClose: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const PlayerStats: React.FC<PlayerStatsProps> = ({ stats, onClose }) => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        duration: 0.5,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-primary-light rounded-xl p-6 shadow-2xl max-w-2xl w-full mx-4 border border-gray-700/50"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold text-white">{stats.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Flag className="h-4 w-4 text-accent-light" />
            <p className="text-accent-light">{stats.country || 'International'}</p>
          </div>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-primary-dark/50 rounded-full"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Personal Information */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-accent-light" />
              Personal Information
            </h4>
            
            <div className="space-y-3">
              <InfoItem
                variants={itemVariants}
                icon={<Calendar className="h-4 w-4 text-accent-light" />}
                label="Born"
                value={stats.personalInfo?.dateOfBirth ? 
                  new Date(stats.personalInfo.dateOfBirth).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '---'
                }
              />

              <InfoItem
                variants={itemVariants}
                icon={<MapPin className="h-4 w-4 text-accent-light" />}
                label="Birth Place"
                value={stats.personalInfo?.birthPlace || '---'}
              />

              <InfoItem
                variants={itemVariants}
                icon={<Trophy className="h-4 w-4 text-accent-light" />}
                label="Role"
                value={stats.personalInfo?.role || '---'}
              />

              <InfoItem
                variants={itemVariants}
                icon={<GanttChartSquare className="h-4 w-4 text-accent-light rotate-90" />}
                label="Batting"
                value={stats.personalInfo?.battingStyle || '---'}
              />

              <InfoItem
                variants={itemVariants}
                icon={<Target className="h-4 w-4 text-accent-light" />}
                label="Bowling"
                value={stats.personalInfo?.bowlingStyle || '---'}
              />
            </div>
          </div>

          {/* Teams */}
          {stats.teams && stats.teams.length > 0 && (
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Flag className="h-5 w-5 text-accent-light" />
                Teams
              </h4>
              <div className="flex flex-wrap gap-2">
                {stats.teams.map((team, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-primary-dark/50 text-gray-300 rounded-full text-sm hover:bg-accent-main/10 hover:text-white transition-colors"
                  >
                    {team}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ICC Rankings */}
        {stats.rankings && (
          <motion.div variants={itemVariants} className="space-y-6">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-accent-light" />
              ICC Rankings
            </h4>
            <div className="bg-primary-dark rounded-xl p-4 shadow-lg border border-gray-700/50">
              {/* Format Headers */}
              <div className="grid grid-cols-4 gap-4 text-center mb-4">
                <div className="text-gray-400"></div>
                {['Test', 'ODI', 'T20'].map((format) => (
                  <div key={format} className="text-gray-400 text-sm font-medium">
                    {format}
                  </div>
                ))}
              </div>
              
              {/* Batting Rankings */}
              <RankingRow
                variants={itemVariants}
                icon={<GanttChartSquare className="h-4 w-4 rotate-90" />}
                label="Batting"
                rankings={stats.rankings.batting}
              />
              
              {/* Bowling Rankings */}
              <RankingRow
                variants={itemVariants}
                icon={<Target className="h-4 w-4" />}
                label="Bowling"
                rankings={stats.rankings.bowling}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  variants: any;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, variants }) => (
  <motion.div variants={variants} className="flex items-center text-gray-300 group">
    <span className="mr-3 group-hover:text-accent-light/80">{icon}</span>
    <span className="text-gray-400 w-28">{label}:</span>
    <span className="group-hover:text-white transition-colors">{value}</span>
  </motion.div>
);

const RankingRow: React.FC<{
  variants: any;
  icon: React.ReactNode;
  label: string;
  rankings: {
    test?: number | null;
    odi?: number | null;
    t20?: number | null;
  };
}> = ({ variants, icon, label, rankings }) => (
  <motion.div 
    variants={variants}
    className="grid grid-cols-4 gap-4 text-center hover:bg-primary-light/5 p-2 rounded-lg transition-colors"
  >
    <div className="text-left text-gray-400 flex items-center">
      {icon}
      <span className="ml-2">{label}</span>
    </div>
    {['test', 'odi', 't20'].map((format) => (
      <RankDisplay 
        key={format}
        rank={rankings[format]}
      />
    ))}
  </motion.div>
);

const RankDisplay: React.FC<{ rank: number | null | undefined }> = ({ rank }) => {
  if (!rank) return <div className="text-gray-500">---</div>;
  
  return (
    <div className="text-white font-medium flex items-center justify-center gap-1">
      {rank === 1 ? (
        <Trophy className="h-4 w-4 text-yellow-500" />
      ) : rank <= 3 ? (
        <Trophy className="h-4 w-4 text-accent-light" />
      ) : null}
      {rank}
    </div>
  );
};

export default PlayerStats;