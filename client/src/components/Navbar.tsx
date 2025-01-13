import React from 'react';

interface NavbarProps {
  onTypeChange: (type: 'live' | 'upcoming') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onTypeChange }) => {
  return (
    <nav className="bg-gray-900 p-4 flex justify-between">
      <h1 className="text-white text-2xl">Cricket Predictor</h1>
      <div>
        <button
          onClick={() => onTypeChange('live')}
          className="text-white mr-4"
        >
          Live
        </button>
        <button
          onClick={() => onTypeChange('upcoming')}
          className="text-white"
        >
          Upcoming
        </button>
      </div>
    </nav>
  );
};

export default Navbar;