const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Search users by email
router.get('/search', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { email } = req.query;
    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: req.user.id } // Exclude current user
    }).select('name email profileImage');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users' });
  }
});

// Send friend request
router.post('/request', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { userId } = req.body;
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if request already exists
    const existingRequest = targetUser.friendRequests.find(
      request => request.from.toString() === req.user.id
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    targetUser.friendRequests.push({
      from: req.user.id,
      status: 'pending'
    });

    await targetUser.save();
    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending friend request' });
  }
});

// Handle friend request (accept/reject)
router.post('/request/:requestId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const user = await User.findById(req.user.id);

    const request = user.friendRequests.id(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (action === 'accept') {
      user.friends.push(request.from);
      const otherUser = await User.findById(request.from);
      otherUser.friends.push(user._id);
      await otherUser.save();
    }

    user.friendRequests.pull(requestId);
    await user.save();

    res.json({ message: `Friend request ${action}ed` });
  } catch (error) {
    res.status(500).json({ message: 'Error handling friend request' });
  }
});

// Remove friend
router.post('/remove', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { friendId } = req.body;
    const user = await User.findById(req.user.id);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    // Remove friend from both users' friend lists
    user.friends = user.friends.filter(id => !id.equals(friendId));
    friend.friends = friend.friends.filter(id => !id.equals(user._id));

    await Promise.all([user.save(), friend.save()]);
    res.json({ success: true, friends: user.friends });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend' });
  }
});

// Get friend list
router.get('/list', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'name email profileImage')
      .populate({
        path: 'friendRequests.from',
        select: 'name email profileImage'
      });

    res.json({
      friends: user.friends,
      friendRequests: user.friendRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friends list' });
  }
});

module.exports = router;
