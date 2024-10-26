// backend/routes/users.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const User = require('../models/User');
const passport = require('passport');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ email: 'Email already exists' });
    }

    user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { id: user.id, name: user.name, email: user.email };
    const token = jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 });

    res.json({ success: true, token: 'Bearer ' + token });
  } catch (error) {
    console.error('There was an error registering the user!', error);
    res.status(500).send('Server error');
  }
});

// Profile route
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json(req.user);
});

// Add game to owned games list route
router.post('/add-owned-game', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { gameTitle, gameId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.ownedGames.some(game => game.id === gameId)) {
      user.ownedGames.push({ title: gameTitle, id: gameId });
      await user.save();
      res.json({ success: true, ownedGames: user.ownedGames });
    } else {
      res.status(400).json({ success: false, message: 'Game already in owned list' });
    }
  } catch (error) {
    console.error('Error adding owned game:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove game from owned games list route
router.post('/remove-owned-game', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { gameId } = req.body;
    const user = await User.findById(req.user.id);

    user.ownedGames = user.ownedGames.filter(game => game.id !== gameId);
    await user.save();
    res.json({ success: true, ownedGames: user.ownedGames });
  } catch (error) {
    console.error('Error removing owned game:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;