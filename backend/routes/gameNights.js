const express = require('express');
const router = express.Router();
const passport = require('passport');
const GameNight = require('../models/GameNight');

// Create a new game night
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { title, date, location, description } = req.body;

    const gameNight = new GameNight({
      title,
      date,
      location,
      description,
      host: req.user.id
    });

    await gameNight.save();

    res.status(201).json({
      success: true,
      gameNight
    });
  } catch (error) {
    console.error('Error creating game night:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating game night'
    });
  }
});

// Get all game nights for a user (both hosted and invited)
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const gameNights = await GameNight.find({
      $or: [
        { host: req.user.id },
        { 'invitees.user': req.user.id }
      ]
    })
      .populate('host', 'name email')
      .populate('invitees.user', 'name email')
      .sort({ date: 1 });

    res.json({
      success: true,
      gameNights
    });
  } catch (error) {
    console.error('Error fetching game nights:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching game nights'
    });
  }
});

module.exports = router; 