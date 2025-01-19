// src/models/Team.js
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String,
    default: '' 
  },
  isCaptain: { 
    type: Boolean, 
    default: false 
  },
  isWicketkeeper: { 
    type: Boolean, 
    default: false 
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const teamSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  squad: [playerSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
teamSchema.index({ name: 1 });

module.exports = mongoose.model('Team', teamSchema);