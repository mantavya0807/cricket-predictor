// src/routes/players.js
const express = require('express');
const router = express.Router();
const PlayerService = require('../services/playerService');

// GET /api/players/:playerId - Get player details
router.get('/:playerId', async (req, res) => {
    try {
        const player = await PlayerService.getPlayerDetails(req.params.playerId);
        res.json(player);
    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({ error: 'Failed to fetch player details' });
    }
});

// GET /api/players/match/:matchId - Get all players for a match
router.get('/match/:matchId', async (req, res) => {
    try {
        const players = await PlayerService.getPlayersForMatch(req.params.matchId);
        res.json(players);
    } catch (error) {
        console.error('Error fetching match players:', error);
        res.status(500).json({ error: 'Failed to fetch match players' });
    }
});

// GET /api/players/role/:role - Get players by role
router.get('/role/:role', async (req, res) => {
    try {
        const players = await PlayerService.getPlayersByRole(req.params.role);
        res.json(players);
    } catch (error) {
        console.error('Error fetching players by role:', error);
        res.status(500).json({ error: 'Failed to fetch players by role' });
    }
});

module.exports = router;