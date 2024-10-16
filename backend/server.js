// server.js
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/game-night-manager', { useNewUrlParser: true, useUnifiedTopology: true });

// Define routes
app.use('/api/users', require('./routes/users'));
app.use('/api/game-nights', require('./routes/gameNights'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));