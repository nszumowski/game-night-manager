const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameNightSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  location: {
    type: String
  },
  description: {
    type: String
  },
  invitees: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  selectedGames: [{
    game: {
      type: Schema.Types.ObjectId,
      ref: 'games'
    },
    votes: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    }]
  }],
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = GameNight = mongoose.model('gameNights', GameNightSchema); 