// src/components/Welcome/Welcome.tsx
import { motion } from 'framer-motion';

const Welcome = () => {
  return (
    <div className="h-screen bg-gradient-to-b from-primary-dark to-primary-main flex items-center justify-center relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Welcome to <span className="text-accent-light">Cricket Live</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Stay updated with real-time cricket scores, match details, and upcoming fixtures 
          from around the world.
        </p>
        
        <motion.div
          animate={{ 
            y: [0, 10, 0],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2 
          }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-gray-400"
        >
          <div className="text-sm mb-2">Scroll to see matches</div>
          <svg 
            className="w-6 h-6 mx-auto" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </motion.div>
      </motion.div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>
    </div>
  );
};

export default Welcome;