const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const compression = require('compression');
require('dotenv').config();

// Import models first to ensure they're registered
require('./models/User');
require('./models/GameNight');
require('./models/Game');

const app = express();

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Configure Passport
require('./config/passport')(passport);

// Import routes
const users = require('./routes/users');
const games = require('./routes/games');
const friends = require('./routes/friends');
const authRoutes = require('./routes/auth');
const gameNights = require('./routes/game-nights');

// Routes
app.use('/api/users', users);
app.use('/api/games', games);
app.use('/api/friends', friends);
app.use('/api/auth', authRoutes);
app.use('/api/game-nights', gameNights);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Static files middleware
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads', 'profiles')));

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Catch-all route
app.get('*path', (req, res) => {
  // Only handle non-API and non-upload requests
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
