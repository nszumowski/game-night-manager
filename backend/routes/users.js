// backend/routes/users.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const User = require('../models/User');
const Game = require('../models/Game');
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

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ email: 'Email not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const payload = { id: user.id, name: user.name, email: user.email };
      const token = jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 });
      res.json({ success: true, token: 'Bearer ' + token });
    } else {
      return res.status(400).json({ password: 'Password incorrect' });
    }
  } catch (error) {
    console.error('There was an error logging in the user!', error);
    res.status(500).send('Server error');
  }
});

// Profile route
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('ownedGames');
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add game to owned games list route
router.post('/add-owned-game', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { gameTitle, gameId } = req.body;
    const user = await User.findById(req.user.id);

    let game = await Game.findOne({ bggId: gameId });
    if (!game) {
      game = new Game({
        title: gameTitle,
        bggId: gameId
      });
      await game.save();
    }

    if (!user.ownedGames.includes(game._id)) {
      user.ownedGames.push(game._id);
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
    const game = await Game.findOne({ bggId: gameId });

    if (game) {
      user.ownedGames = user.ownedGames.filter(ownedGameId => !ownedGameId.equals(game._id));
      await user.save();
      res.json({ success: true, ownedGames: user.ownedGames });
    } else {
      res.status(404).json({ success: false, message: 'Game not found' });
    }
  } catch (error) {
    console.error('Error removing owned game:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
