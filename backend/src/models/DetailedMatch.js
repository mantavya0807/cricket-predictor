// src/models/DetailedMatch.js
const mongoose = require('mongoose');

const detailedMatchSchema = new mongoose.Schema({
    // Match identification and metadata
    matchId: {
        type: String,
        required: true,
        unique: true
    },
    matchType: {
        type: String,
        enum: ['TEST', 'ODI', 'T20', 'OTHER'],
        required: true
    },
    status: {
        type: String,
        enum: ['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED', 'POSTPONED'],
        required: true
    },
    basicInfo: {
        matchTitle: String,
        series: {
            id: String,
            name: String,
            type: String
        },
        venue: {
            name: String,
            city: String,
            country: String,
            capacity: Number,
            floodlights: Boolean,
            pitch: {
                type: String,
                condition: String
            },
            weather: {
                temperature: Number,
                condition: String,
                humidity: Number,
                windSpeed: Number
            }
        },
        dateTime: {
            date: Date,
            time: String,
            timezone: String,
            isMultiDay: Boolean,
            estimatedEndDate: Date
        },
        toss: {
            winner: String,
            decision: String,
            time: Date
        }
    },
    teams: {
        team1: {
            id: String,
            name: String,
            shortName: String,
            players: [{
                id: String,
                name: String,
                role: String,
                captain: Boolean,
                keeper: Boolean,
                substitute: Boolean
            }]
        },
        team2: {
            id: String,
            name: String,
            shortName: String,
            players: [{
                id: String,
                name: String,
                role: String,
                captain: Boolean,
                keeper: Boolean,
                substitute: Boolean
            }]
        }
    },
    innings: [{
        number: Number,
        battingTeam: String,
        score: {
            runs: Number,
            wickets: Number,
            overs: Number,
            extras: {
                byes: Number,
                legByes: Number,
                wides: Number,
                noBalls: Number,
                penalty: Number,
                total: Number
            },
            runRate: Number,
            declared: Boolean
        },
        batting: [{
            player: String,
            runs: Number,
            balls: Number,
            fours: Number,
            sixes: Number,
            strikeRate: Number,
            dismissal: {
                type: String,
                bowler: String,
                fielder: String,
                description: String
            }
        }],
        bowling: [{
            player: String,
            overs: Number,
            maidens: Number,
            runs: Number,
            wickets: Number,
            economy: Number,
            dots: Number,
            fours: Number,
            sixes: Number
        }],
        fallOfWickets: [{
            score: Number,
            wicket: Number,
            player: String,
            overs: Number
        }],
        partnerships: [{
            runs: Number,
            balls: Number,
            batsmen: [String]
        }]
    }],
    result: {
        winner: String,
        margin: String,
        description: String,
        matchEndTime: Date,
        duckworthLewis: Boolean,
        method: String
    },
    awards: {
        playerOfTheMatch: [{
            name: String,
            team: String,
            performance: {
                batting: String,
                bowling: String,
                fielding: String
            }
        }],
        playerOfTheSeries: [{
            name: String,
            team: String,
            performance: String
        }]
    },
    matchStats: {
        toss: String,
        latestPerformance: String,
        recentOvers: String,
        partnership: String,
        lastWicket: String
    },
    commentary: [{
        timestamp: Date,
        over: String,
        description: String,
        type: String // regular, wicket, boundary, etc.
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.DetailedMatch || mongoose.model('DetailedMatch', detailedMatchSchema);