const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// Get Squad by Team Name
router.get('/:teamName', async (req, res) => {
  try {
    const team = await Team.findOne({ name: req.params.teamName });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    console.error('Failed to fetch team squad:', err);
    res.status(500).json({ error: 'Failed to fetch team squad' });
  }
});


module.exports = router;