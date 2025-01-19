const mongoose = require('mongoose');
const Match = require('../models/Match');
const Squad = require('../models/Squad');
const SquadScraper = require('../services/scrapers/squadScraper');
const liveMatchScraper = require('../services/scrapers/liveMatchScraper');
const upcomingMatchScraper = require('../services/scrapers/upcomingMatchScraper');
const scraperUtil = require('../utils/scraper');
const cron = require('node-cron');

class MatchService {
    constructor() {
        console.log('Initializing MatchService...');
        this.squadScraper = SquadScraper;
        this.setupScheduledTasks();
        // this.initialScrape();
    }

    setupScheduledTasks() {
        // Scrape live matches every minute
        // cron.schedule('*/1 * * * *', async () => {
        //     try {
        //         console.log('Running update for live matches...');
        //         await this.scrapeLiveMatches();
        //         await this.getLiveMatches();
        //     } catch (error) {
        //         console.error('Error in scheduled squad update:', error);
        //     }
        // });

        // Scrape upcoming matches and their squads every day at midnight
        cron.schedule('0 0 * * *', async () => {
            try {
                console.log('Scraping upcoming matches...');
                const upcomingMatches = await this.scrapeUpcomingMatches();
                console.log(`Found ${upcomingMatches.length} upcoming matches`);
                
                // Then scrape squads for those matches
                if (upcomingMatches.length > 0) {
                    console.log('Scraping squads for upcoming matches...');
                    await this.scrapeSquadsForUpcoming();
                }
            } catch (error) {
                console.error('Error in scheduled upcoming match scraping:', error);
            }
        });

        // Removed initialScrape to prevent scraping on server start
        // this.initialScrape();
    }

    async initialScrape() {
        try {
            console.log('Starting initial data scrape...');
            
            // First scrape upcoming matches
            console.log('Scraping upcoming matches...');
            const upcomingMatches = await this.scrapeUpcomingMatches();
            console.log(`Found ${upcomingMatches.length} upcoming matches`);
            
            // Then scrape squads for those matches
            if (upcomingMatches.length > 0) {
                console.log('Scraping squads for upcoming matches...');
                await this.scrapeSquadsForUpcoming();
            }
            
            // Finally scrape live matches
            console.log('Scraping live matches...');
            await this.scrapeLiveMatches();
            
            // Scrape player details for all players in the squads
            console.log('Scraping player details for all squads...');
            await this.scrapeAllPlayerDetails();
            
            console.log('Initial data scrape completed successfully');
        } catch (error) {
            console.error('Error during initial scrape:', error);
        }
    }

    async scrapeSquadsForUpcoming() {
        try {
            console.log('Starting squad scraping for upcoming matches...');
            const squads = await this.squadScraper.scrapeSquadsForUpcoming();
            console.log('Successfully completed squad scraping');
            return squads;
        } catch (error) {
            console.error('Error scraping upcoming squads:', error);
            throw error;
        }
    }

    async scrapeLiveMatches() {
        try {
            // Flush current live matches
            await Match.deleteMany({ status: 'LIVE' });
            console.log('Flushed current live matches from the database.');

            const matches = await liveMatchScraper.scrapeLiveMatches();
            console.log(`Scraped ${matches.length} live matches`);
            return matches;
        } catch (err) {
            console.error('Error scraping live matches:', err);
            throw err;
        }
    }

    async scrapeUpcomingMatches() {
        try {
            // Flush current upcoming matches
            await Match.deleteMany({ status: 'UPCOMING' });
            console.log('Flushed current upcoming matches from the database.');

            const matches = await upcomingMatchScraper.scrapeUpcomingMatches();
            console.log(`Scraped ${matches.length} upcoming matches`);
            return matches;
        } catch (err) {
            console.error('Error scraping upcoming matches:', err);
            throw err;
        }
    }

    async scrapeAllPlayerDetails() {
        try {
            const squads = await Squad.find({});
            for (const squad of squads) {
                for (const player of [...squad.team1.players, ...squad.team2.players]) {
                    try {
                        console.log(`Scraping details for player: ${player.name}`);
                        const playerDetails = await this.squadScraper.scrapePlayerDetails(player.playerUrl);
                        const playerId = player.playerUrl.split('/').pop();

                        // Save player to database
                        await Player.findOneAndUpdate(
                            { playerId },
                            {
                                playerId,
                                name: player.name,
                                ...playerDetails,
                                lastUpdated: new Date()
                            },
                            { upsert: true }
                        );
                    } catch (error) {
                        console.error(`Error scraping details for player ${player.name}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Error scraping all player details:', error);
            throw error;
        }
    }

    async getMatchSquad(matchId) {
        try {
            console.log(`Fetching squad for match: ${matchId}`);
            let squad = await Squad.findOne({ matchId });
            
            if (!squad || this.isSquadOutdated(squad)) {
                console.log('Squad not found or outdated, fetching fresh data...');
                const match = await Match.findOne({ matchId });
                if (!match) {
                    throw new Error('Match not found');
                }

                const squadInfo = await this.squadScraper.getSquadInfo(match.matchUrl);
                squad = await Squad.findOneAndUpdate(
                    { matchId },
                    { 
                        team1: squadInfo.team1,
                        team2: squadInfo.team2,
                        status: match.status,
                        lastUpdated: new Date()
                    },
                    { upsert: true, new: true }
                );
                console.log('Squad updated successfully');
            }
            
            return squad;
        } catch (error) {
            console.error(`Error in getMatchSquad for ${matchId}:`, error);
            throw error;
        }
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
            console.log('Fetching live matches from database...');
            let matches = await Match.find({ status: 'LIVE' });
            
            if (!matches.length) {
                console.log('No live matches in database, scraping fresh data...');
                matches = await this.scrapeLiveMatches();
            }
            return matches;
        } catch (err) {
            console.error('Error in getLiveMatches:', err);
            return [];
        }
    }
    
    async getUpcomingMatches() {
        try {
            console.log('Fetching upcoming matches from database...');
            let matches = await Match.find({ status: 'UPCOMING' });
            
            if (!matches.length) {
                console.log('No upcoming matches in database, scraping fresh data...');
                matches = await this.scrapeUpcomingMatches();
            }
            return matches;
        } catch (err) {
            console.error('Error in getUpcomingMatches:', err);
            return [];
        }
    }
}

module.exports = new MatchService();