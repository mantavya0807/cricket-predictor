const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    runs: Number,
    wickets: Number,
    overs: Number,
    declared: Boolean,
    extras: {
        byes: Number,
        legByes: Number,
        wides: Number,
        noBalls: Number,
        total: Number
    },
    runRate: Number
}, { _id: false });

const liveMatchSchema = new mongoose.Schema({
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
        name: String,
        shortName: String,
        score: scoreSchema,
        battingOrder: [String], // Current batting lineup
        batting: [{
            player: String,
            runs: Number,
            balls: Number,
            fours: Number,
            sixes: Number,
            strikeRate: Number,
            isOut: Boolean,
            dismissalType: String,
            dismissedBy: String
        }],
        bowling: [{
            player: String,
            overs: Number,
            maidens: Number,
            runs: Number,
            wickets: Number,
            economy: Number,
            dots: Number
        }]
    },
    team2: {
        name: String,
        shortName: String,
        score: scoreSchema,
        battingOrder: [String],
        batting: [{
            player: String,
            runs: Number,
            balls: Number,
            fours: Number,
            sixes: Number,
            strikeRate: Number,
            isOut: Boolean,
            dismissalType: String,
            dismissedBy: String
        }],
        bowling: [{
            player: String,
            overs: Number,
            maidens: Number,
            runs: Number,
            wickets: Number,
            economy: Number,
            dots: Number
        }]
    },
    venue: {
        name: String,
        city: String,
        country: String
    },
    currentState: {
        battingTeam: String,  // 'team1' or 'team2'
        innings: Number,
        required: {
            runs: Number,
            runRate: Number,
            balls: Number
        },
        partnership: {
            runs: Number,
            balls: Number,
            batsmen: [String]
        },
        lastWicket: {
            player: String,
            score: Number,
            over: Number
        },
        recentOvers: [{
            over: Number,
            runs: Number,
            wickets: Number,
            events: [String]
        }]
    },
    matchStatus: {
        type: String,
        enum: ['LIVE', 'INNINGS_BREAK', 'STUMPS', 'TEA', 'LUNCH', 'RAIN_DELAY', 'BAD_LIGHT', 'COMPLETED'],
        required: true
    },
    result: {
        winner: String,
        margin: String,
        description: String
    },
    toss: {
        winner: String,
        decision: String
    },
    startTime: Date,
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
liveMatchSchema.index({ matchId: 1 }, { unique: true });
liveMatchSchema.index({ matchStatus: 1 });
liveMatchSchema.index({ 'team1.name': 1, 'team2.name': 1 });

// Static method to flush all live matches
liveMatchSchema.statics.flushAll = async function() {
    return this.deleteMany({});
};

const LiveMatch = mongoose.model('LiveMatch', liveMatchSchema);

module.exports = LiveMatch;