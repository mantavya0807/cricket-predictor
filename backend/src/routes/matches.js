// src/routes/matches.js
const express = require('express');
const router = express.Router();
const MatchService = require('../services/matchService');

// GET /api/matches - Get all matches
router.get('/', async (req, res) => {
    try {
        const matches = await MatchService.scrapeLiveMatches();
        const upcomingMatches = await MatchService.scrapeUpcomingMatches();
        res.json(matches);
    } catch (error) {
        console.log('Error fetching matches:', error);
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});

// GET /api/matches/live - Get live matches
router.get('/live', async (req, res) => {
    try {
        console.log('Fetching live matches...');
        await MatchService.scrapeLiveMatches(); // First scrape the live matches
        const matches = await MatchService.getLiveMatches(); // Then get the live matches
        res.json(matches);
    } catch (error) {
        console.error('Error fetching live matches:', error);
        res.status(500).json({ error: 'Failed to fetch live matches' });
    }
});

// GET /api/matches/upcoming - Get upcoming matches
router.get('/upcoming', async (req, res) => {
    try {
        console.log('Fetching upcoming matches...');
        const matches = await MatchService.getUpcomingMatches();
        res.json(matches);
    } catch (error) {
        console.error('Error fetching upcoming matches:', error);
        res.status(500).json({ error: 'Failed to fetch upcoming matches' });
    }
});
// GET /api/matches/:matchId/squad
router.get('/:matchId/squad', async (req, res) => {
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
// POST /api/matches/refresh - Force refresh matches
router.post('/refresh', async (req, res) => {
    try {
        const [liveMatches, upcomingMatches] = await Promise.all([
            MatchService.scrapeLiveMatches(),
            MatchService.scrapeUpcomingMatches()
        ]);

        res.json({
            liveMatches,
            upcomingMatches
        });
    } catch (error) {
        console.error('Error refreshing matches:', error);
        res.status(500).json({ error: 'Failed to refresh matches' });
    }
});

// Trigger Scraping Upcoming Matches
router.get('/scrape/upcoming', async (req, res) => {
    try {
        console.log('Scraping upcoming matches...');
        await MatchService.scrapeUpcomingMatches();
        res.json({ success: true });
    } catch (error) {
        console.error('Error scraping upcoming matches:', error);
        res.status(500).json({ error: 'Failed to scrape upcoming matches' });
    }
});

module.exports = router;