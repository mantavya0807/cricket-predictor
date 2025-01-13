const express = require('express');
const router = express.Router();
const MatchService = require('../services/matchService');
const SquadScraper = require('../services/squadscraper');

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

module.exports = router;