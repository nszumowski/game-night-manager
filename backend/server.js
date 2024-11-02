const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const cors = require('cors');
const users = require('./routes/users');
const games = require('./routes/games');
const friends = require('./routes/friends');
const path = require('path');

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
// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
