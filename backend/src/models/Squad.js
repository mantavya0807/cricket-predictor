const mongoose = require('mongoose');

const squadSchema = new mongoose.Schema({
    matchId: {
        type: String,
        required: true,
        unique: true
    },
    team1: {
        name: String,
        players: [{
            name: String,
            role: String,
            isCaptain: Boolean,
            isWicketkeeper: Boolean
        }]
    },
    team2: {
        name: String,
        players: [{
            name: String,
            role: String,
            isCaptain: Boolean,
            isWicketkeeper: Boolean
        }]
    },
    status: {
        type: String,
        enum: ['LIVE', 'UPCOMING', 'COMPLETED'],
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Squad || mongoose.model('Squad', squadSchema);