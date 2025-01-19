// src/routes/matches.js
const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const liveMatchScraper = require('../services/scrapers/liveMatchScraper');
const upcomingMatchScraper = require('../services/scrapers/upcomingMatchScraper');
const enhancedScraper = require('../services/scrapers/enhancedScraper');

// GET /api/matches - Get all matches
router.get('/', async (req, res) => {
    try {
        const [liveMatches, upcomingMatches] = await Promise.all([
            Match.find({ status: 'LIVE' }).sort({ lastUpdated: -1 }),
            Match.find({ status: 'UPCOMING' }).sort({ startTime: 1 })
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
        // First try to fetch from scraper
        let matches;
        try {
            matches = await liveMatchScraper.scrapeLiveMatches();
        } catch (error) {
            console.error('Error scraping live matches:', error);
            // If scraping fails, get from database
            matches = await Match.find({ status: 'LIVE' }).sort({ lastUpdated: -1 });
        }

        res.json(matches);
    } catch (error) {
        console.error('Error in /live route:', error);
        res.status(500).json({ error: 'Failed to fetch live matches' });
    }
});

// GET /api/matches/upcoming - Get upcoming matches
router.get('/upcoming', async (req, res) => {
    try {
        // First try to fetch from scraper
        let matches;
        try {
            matches = await upcomingMatchScraper.scrapeUpcomingMatches();
        } catch (error) {
            console.error('Error scraping upcoming matches:', error);
            // If scraping fails, get from database
            matches = await Match.find({ status: 'UPCOMING' }).sort({ startTime: 1 });
        }

        res.json(matches);
    } catch (error) {
        console.error('Error in /upcoming route:', error);
        res.status(500).json({ error: 'Failed to fetch upcoming matches' });
    }
});

// POST /api/matches/refresh - Force refresh matches
router.post('/refresh', async (req, res) => {
    try {
        const [liveMatches, upcomingMatches] = await Promise.all([
            liveMatchScraper.scrapeLiveMatches(),
            upcomingMatchScraper.scrapeUpcomingMatches()
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

// GET /api/matches/:matchId/squad
router.get('/:matchId/squad', async (req, res) => {
    try {
        const squad = await enhancedScraper.getSquadInfo(req.params.matchId);
        if (!squad) {
            return res.status(404).json({ error: 'Squad not found' });
        }
        res.json(squad);
    } catch (error) {
        console.error('Error fetching squad:', error);
        res.status(500).json({ error: 'Failed to fetch squad information' });
    }
});

module.exports = router;