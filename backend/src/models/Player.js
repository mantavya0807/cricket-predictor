const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
  batting: {
    test: { type: Number, default: null },
    odi: { type: Number, default: null },
    t20: { type: Number, default: null }
  },
  bowling: {
    test: { type: Number, default: null },
    odi: { type: Number, default: null },
    t20: { type: Number, default: null }
  }
}, { _id: false });

const playerSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  personalInfo: {
    dateOfBirth: Date,
    birthPlace: String,
    height: String,
    role: String,
    battingStyle: String,
    bowlingStyle: String
  },
  country: String,
  teams: [String],
  rankings: rankingSchema,
  imageUrl: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
playerSchema.index({ playerId: 1 });
playerSchema.index({ name: 1 });

// Virtual for age calculation
playerSchema.virtual('age').get(function() {
  if (!this.personalInfo.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;