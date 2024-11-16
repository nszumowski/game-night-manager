// backend/routes/users.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const User = require('../models/User');
const Game = require('../models/Game');
const passport = require('passport');
const xss = require('xss');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const fsPromises = require('fs').promises;

const router = express.Router();

// Add multer configuration at the top of the file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Create a middleware function for image processing
const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    // Read the image metadata
    const metadata = await sharp(req.file.path).metadata();

    // Calculate dimensions maintaining aspect ratio
    let width = 300; // Default target width
    let height = 300; // Default target height

    // Ensure smallest dimension is at least 100px
    if (metadata.width < metadata.height) {
      width = 100;
      height = Math.round((metadata.height / metadata.width) * 100);
    } else {
      height = 100;
      width = Math.round((metadata.width / metadata.height) * 100);
    }

    // Process the image
    await sharp(req.file.path)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80, progressive: true })
      .toFile(`${req.file.path}-processed`);

    // Replace original file with processed one
    await fsPromises.unlink(req.file.path);
    await fsPromises.rename(`${req.file.path}-processed`, req.file.path);

    next();
  } catch (error) {
    console.error('Error processing image:', error);
    next(error);
  }
};

// Register route
router.post('/register', async (req, res) => {
  let { name, email, password } = req.body;

  try {
    // Sanitize and validate name
    name = xss(name.trim());
    if (name.length < 1 || name.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 1 and 50 characters'
      });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ email: 'Email already exists' });
    }

    user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { id: user.id, name: user.name, email: user.email };
    const token = jwt.sign(payload, keys.secretOrKey, { expiresIn: 60 });

    res.json({ success: true, token: 'Bearer ' + token });
  } catch (error) {
    console.error('There was an error registering the user!', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
      const token = jwt.sign(payload, keys.secretOrKey, { expiresIn: 60 });
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
    const user = await User.findById(req.user.id)
      .populate({
        path: 'ownedGames',
        select: 'title bggId year image minPlayers maxPlayers bestWith'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bggUsername: user.bggUsername,
        date: user.date,
        profileImage: user.profileImage
      },
      ownedGames: user.ownedGames
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile route
router.put('/update-profile', passport.authenticate('jwt', { session: false }), upload.single('profileImage'), processImage, async (req, res) => {
  try {
    let { name, bggUsername, removeImage } = req.body;

    // If we're only removing the image, use the existing user data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Handle image removal
    if (removeImage === 'true' && user.profileImage) {
      try {
        const oldImagePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profileImage);
        console.log('Attempting to delete image at:', oldImagePath);

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('Successfully deleted old image');
        }

        user.profileImage = null;
        await user.save();

        return res.json({
          success: true,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            bggUsername: user.bggUsername,
            profileImage: null,
            date: user.date
          }
        });
      } catch (fileError) {
        console.error('Error deleting image file:', fileError);
        return res.status(500).json({
          success: false,
          message: 'Error removing profile image',
          error: fileError.message
        });
      }
    }

    // Regular profile update logic...
    if (name) {
      name = xss(name.trim());
      if (name.length < 1 || name.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 1 and 50 characters'
        });
      }
      user.name = name;
    }

    if (bggUsername) {
      user.bggUsername = xss(bggUsername.trim());
    }

    // Handle profile image update
    if (req.file) {
      // Handle new image upload
      if (user.profileImage) {
        const oldImagePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      user.profileImage = req.file.filename;
    }

    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bggUsername: user.bggUsername,
        profileImage: user.profileImage,
        date: user.date
      }
    });
  } catch (error) {
    console.error('Error in update-profile route:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Add game to owned games list route
router.post('/add-owned-game', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { gameTitle, gameId, minPlayers, maxPlayers, bestWith, year, image } = req.body;
    const user = await User.findById(req.user.id);

    let game = await Game.findOne({ bggId: gameId });
    if (!game) {
      game = new Game({
        title: gameTitle,
        bggId: gameId,
        minPlayers,
        maxPlayers,
        bestWith,
        year,
        image
      });
      await game.save();
    } else {
      // Update existing game with new data
      game.minPlayers = minPlayers;
      game.maxPlayers = maxPlayers;
      game.bestWith = bestWith;
      game.year = year;
      game.image = image;
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

// Refresh token route
router.post('/refresh-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Refresh token request headers:', req.headers);
    console.log('Authorization header:', authHeader);

    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // Verify the existing token
    const token = authHeader.replace('Bearer ', '');
    console.log('Token to verify:', token);

    try {
      // Try to decode the token without verification
      const decoded = jwt.decode(token);
      console.log('Decoded token:', decoded);

      if (!decoded || !decoded.id) {
        return res.status(401).json({ success: false, message: 'Invalid token format' });
      }

      // Check if the user exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Generate a new token
      const payload = { id: decoded.id, name: decoded.name, email: decoded.email };
      const newToken = jwt.sign(payload, keys.secretOrKey, { expiresIn: 60 });
      console.log('New token generated:', newToken);

      res.json({ success: true, token: 'Bearer ' + newToken });
    } catch (decodeError) {
      console.error('Token decode error:', decodeError);
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Verify token route
router.get('/verify-token', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ valid: true });
});

// Get user profile by ID
router.get('/profile/:userId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('ownedGames');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bggUsername: user.bggUsername,
        profileImage: user.profileImage,
        date: user.date,
        ownedGames: user.ownedGames
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
