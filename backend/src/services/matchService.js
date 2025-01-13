// src/services/matchService.js
const cron = require('node-cron');
const Match = require('../models/Match');
const Squad = require('../models/Squad');
const SquadScraper = require('./squadscraper');

class MatchService {
    constructor() {
        this.squadScraper = new SquadScraper();
        this.setupScheduledTasks();
    }

    setupScheduledTasks() {
        // Update live match squads every 30 minutes
        cron.schedule('*/30 * * * *', async () => {
            try {
                console.log('Running scheduled squad update for live matches...');
                await this.updateLiveMatchSquads();
            } catch (error) {
                console.error('Error in scheduled squad update:', error);
            }
        });

        // Update upcoming match squads daily at midnight
        cron.schedule('0 0 * * *', async () => {
            try {
                console.log('Running daily squad update for upcoming matches...');
                await this.updateUpcomingMatchSquads();
            } catch (error) {
                console.error('Error in daily squad update:', error);
            }
        });
    }

    async updateLiveMatchSquads() {
        const liveMatches = await Match.find({ status: 'LIVE' });
        
        for (const match of liveMatches) {
            try {
                await this.updateMatchSquad(match);
            } catch (error) {
                console.error(`Error updating squad for match ${match.matchId}:`, error);
            }
        }
    }

    async updateUpcomingMatchSquads() {
        const upcomingMatches = await Match.find({ 
            status: 'UPCOMING',
            startTime: { 
                $gte: new Date(),
                $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
            }
        });
        
        for (const match of upcomingMatches) {
            try {
                await this.updateMatchSquad(match);
            } catch (error) {
                console.error(`Error updating squad for match ${match.matchId}:`, error);
            }
        }
    }

    async updateMatchSquad(match) {
        try {
            const matchUrl = `/live-cricket-scores/${match.matchId}`;
            const squadInfo = await this.squadScraper.getSquadInfo(matchUrl);
            
            await Squad.findOneAndUpdate(
                { matchId: match.matchId },
                { 
                    ...squadInfo,
                    lastUpdated: new Date()
                },
                { upsert: true }
            );

            console.log(`Successfully updated squad for match ${match.matchId}`);
        } catch (error) {
            console.error(`Failed to update squad for match ${match.matchId}:`, error);
            throw error;
        }
    }

    async getMatchSquad(matchId) {
        let squad = await Squad.findOne({ matchId });
        
        if (!squad || this.isSquadOutdated(squad)) {
            const match = await Match.findOne({ matchId });
            if (!match) {
                throw new Error('Match not found');
            }

            const squadInfo = await this.squadScraper.getSquadInfo(match.matchUrl);
            squad = await Squad.findOneAndUpdate(
                { matchId },
                { 
                    ...squadInfo,
                    status: match.status,
                    lastUpdated: new Date()
                },
                { upsert: true, new: true }
            );
        }
        
        return squad;
    }

    isSquadOutdated(squad) {
        const hoursSinceUpdate = (Date.now() - squad.lastUpdated.getTime()) / (1000 * 60 * 60);
        
        switch (squad.status) {
            case 'LIVE':
                return hoursSinceUpdate > 1;
            case 'UPCOMING':
                return hoursSinceUpdate > 12;
            default:
                return hoursSinceUpdate > 24;
        }
    }

    async getLiveMatches() {
        try {
            return await Match.find({ status: 'LIVE' }).sort({ lastUpdated: -1 });
        } catch (err) {
            console.error('Error fetching live matches:', err);
            throw err;
        }
    }

    async getUpcomingMatches() {
        try {
            return await Match.find({ status: 'UPCOMING' }).sort({ startTime: 1 });
        } catch (err) {
            console.error('Error fetching upcoming matches:', err);
            throw err;
        }
    }
}

module.exports = new MatchService();