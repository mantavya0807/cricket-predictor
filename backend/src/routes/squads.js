const express = require('express');
const router = express.Router();
const MatchService = require('../services/matchService');
const SquadScraper = require('../services/scrapers/squadScraper');

// GET /api/squads/:matchId - Get squad for a specific match
router.get('/:matchId', async (req, res) => {
    try {
        const squad = await MatchService.getMatchSquad(req.params.matchId);
        if (!squad) {
            return res.status(404).json({ error: 'Squad not found' });
        }
        res.json(squad);
    } catch (error) {
        console.error('Error fetching squad:', error);
        res.status(500).json({ error: 'Failed to fetch squad information' });
    }
});

router.get('/scrape/upcoming', async (req, res) => {
    try {
        console.log('Scraping squads for upcoming matches...');
        const squadScraper = new SquadScraper();
        const upcomingSquadData = await squadScraper.scrapeSquadsForUpcoming();

        // Save or update your DB with upcomingSquadData here
        for (const squad of upcomingSquadData) {
            await MatchService.updateMatchSquad(squad);
        }

        res.json({ success: true, data: upcomingSquadData });
    } catch (error) {
        console.error('Error scraping upcoming squads:', error);
        res.status(500).json({ error: 'Failed to scrape upcoming squads' });
    }
});

// GET /api/matches/:matchId/squad - Get squad for a specific match
router.get('/:matchId/squad', async (req, res) => {
    try {
        // First get the match to get team names
        const match = await Match.findOne({ matchId: req.params.matchId });
        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        // Get both teams' data from the Team collection
        const [team1Data, team2Data] = await Promise.all([
            Team.findOne({ name: match.team1 }),
            Team.findOne({ name: match.team2 })
        ]);

        if (!team1Data || !team2Data) {
            return res.status(404).json({ error: 'Team data not found' });
        }

        // Fetch detailed player information for both teams
        const team1Players = await Promise.all(
            team1Data.squad.map(async (player) => {
                const playerDetails = await Player.findOne({ name: player.name });
                return {
                    ...player.toObject(),
                    ...playerDetails?.toObject(),
                    role: player.role || playerDetails?.personalInfo?.role
                };
            })
        );

        const team2Players = await Promise.all(
            team2Data.squad.map(async (player) => {
                const playerDetails = await Player.findOne({ name: player.name });
                return {
                    ...player.toObject(),
                    ...playerDetails?.toObject(),
                    role: player.role || playerDetails?.personalInfo?.role
                };
            })
        );

        const squadData = {
            team1: {
                name: team1Data.name,
                players: team1Players
            },
            team2: {
                name: team2Data.name,
                players: team2Players
            }
        };

        res.json(squadData);
    } catch (error) {
        console.error('Error fetching squad:', error);
        res.status(500).json({ error: 'Failed to fetch squad information' });
    }
});

module.exports = router;