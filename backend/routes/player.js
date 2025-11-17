const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const { authenticate } = require('../middleware/auth');

// Create player
router.post('/create', authenticate, async (req, res) => {
  try {
    const { name, battingPosition, battingType, bowlingType } = req.body;

    if (!name || !battingPosition || !battingType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const player = await Player.create({
      name,
      battingPosition,
      battingType,
      bowlingType: bowlingType || 'none'
    });

    res.status(201).json(player);
  } catch (error) {
    console.error('Create player error:', error);
    res.status(500).json({ message: 'Error creating player', error: error.message });
  }
});

module.exports = router;

