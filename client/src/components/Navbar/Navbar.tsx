// src/components/Navbar/Navbar.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('live');
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(tab === 'live' ? '/live' : '/upcoming');
  };

  return (
    <nav className="fixed top-0 w-full bg-primary-main shadow-lg z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <span className="text-2xl font-bold text-white">Cricket</span>
              <span className="text-accent-light font-bold text-2xl">Live</span>
            </motion.div>
          </Link>

          <div className="flex space-x-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTabChange('live')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'live' 
                  ? 'bg-accent-main text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Live Matches
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTabChange('upcoming')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'upcoming' 
                  ? 'bg-accent-main text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Upcoming
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;