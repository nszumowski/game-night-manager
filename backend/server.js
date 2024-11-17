const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const cors = require('cors');
const users = require('./routes/users');
const games = require('./routes/games');
const friends = require('./routes/friends');
const path = require('path');
const compression = require('compression');

require('dotenv').config(); // Load .env file

// Log environment variables during development
if (process.env.NODE_ENV !== 'production') {
  console.log('MONGO_URI:', process.env.MONGO_URI); // Verify MONGO_URI value
  console.log('JWT_SECRET:', process.env.JWT_SECRET); // Verify JWT_SECRET value
  console.log('PORT:', process.env.PORT); // Verify PORT value
  console.log('NODE_ENV:', process.env.NODE_ENV); // Verify NODE_ENV value
}

// Register models
require('./models/User');
require('./models/Game');

const app = express();
app.use(compression());

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

// Passport config
require('./config/passport')(passport);

// Routes
app.use('/api/users', users);
app.use('/api/games', games);
app.use('/api/friends', friends);

// Add this before the static file middleware
app.use('/uploads/profiles', (req, res, next) => {
  console.log('Profile image requested:', req.url);
  console.log('Full path:', path.join(__dirname, 'uploads', 'profiles', req.url));
  next();
}, express.static(path.join(__dirname, 'uploads', 'profiles')));

// Serve the React app static files (if needed)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all route should be last
app.get('*', (req, res) => {
  // Only send index.html for non-API and non-static requests
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  } else {
    res.status(404).send('Not found');
  }
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
