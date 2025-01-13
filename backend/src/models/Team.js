const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  squad: [
    {
      name: { type: String, required: true },
      role: { type: String },
      isCaptain: { type: Boolean, default: false },
      isWicketkeeper: { type: Boolean, default: false }
    }
  ]
});

module.exports = mongoose.model('Team', teamSchema);
