// src/routes/matches.js
const express = require('express');
const router = express.Router();
const MatchService = require('../services/matchService');

// GET /api/matches - Get all matches
router.get('/', async (req, res) => {
    try {
        const [liveMatches, upcomingMatches] = await Promise.all([
            MatchService.getLiveMatches(),
            MatchService.getUpcomingMatches()
        ]);

        res.json({
            liveMatches,
            upcomingMatches
        });
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});

// GET /api/matches/live - Get live matches
router.get('/live', async (req, res) => {
    try {
        const liveMatches = await MatchService.getLiveMatches();
        res.json(liveMatches);
    } catch (error) {
        console.error('Error fetching live matches:', error);
        res.status(500).json({ error: 'Failed to fetch live matches' });
    }
});

// GET /api/matches/upcoming - Get upcoming matches
router.get('/upcoming', async (req, res) => {
    try {
        const upcomingMatches = await MatchService.getUpcomingMatches();
        res.json(upcomingMatches);
    } catch (error) {
        console.error('Error fetching upcoming matches:', error);
        res.status(500).json({ error: 'Failed to fetch upcoming matches' });
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