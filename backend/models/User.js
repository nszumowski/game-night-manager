const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  bggUsername: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  ownedGames: [{
    type: Schema.Types.ObjectId,
    ref: 'games'
  }],
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'users'
  }],
  friendRequests: [{
    from: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  profileImage: {
    type: String,
    default: null
  }
});

module.exports = User = mongoose.model('users', UserSchema);
