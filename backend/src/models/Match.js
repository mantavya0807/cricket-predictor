// src/models/Match.js
const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    runs: Number,
    wickets: Number,
    overs: Number,
    declared: Boolean
}, { _id: false });

const matchSchema = new mongoose.Schema({
    matchId: {
        type: String,
        required: true,
        unique: true
    },
    seriesName: {
        type: String,
        required: true
    },
    matchType: {
        type: String,
        enum: ['TEST', 'ODI', 'T20', 'OTHER'],
        required: true
    },
    team1: {
        type: String,
        required: true
    },
    team2: {
        type: String,
        required: true
    },
    venue: {
        name: String,
        city: String,
        country: String
    },
    startTime: {
        type: Date,
        required: true
    },
    localTime: String,
    gmtTime: String,
    status: {
        type: String,
        enum: ['UPCOMING', 'LIVE', 'COMPLETED'],
        required: true
    },
    currentScore: {
        team1Score: scoreSchema,
        team2Score: scoreSchema,
        battingTeam: String,
        currentState: String
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    matchUrl: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Create compound index for efficient queries
matchSchema.index({ status: 1, startTime: 1 });


const Match = mongoose.model('Match', matchSchema);

module.exports = Match;