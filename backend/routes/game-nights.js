const express = require('express');
const router = express.Router();
const passport = require('passport');
const GameNight = require('../models/GameNight');
const User = require('../models/User');
// const sendEmail = require('../utils/sendEmail');

// Create a new game night
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { title, date, location, description, invitees } = req.body;

    const gameNight = new GameNight({
      title,
      date,
      location,
      description,
      host: req.user.id,
      invitees: invitees.map(userId => ({
        user: userId,
        status: 'pending'
      }))
    });

    await gameNight.save();

    // Send email notifications to invitees
    // const invitedUsers = await User.find({ _id: { $in: invitees } });
    // for (const user of invitedUsers) {
    //   await sendEmail({
    //     to: user.email,
    //     subject: `Game Night Invitation: ${title}`,
    //     text: `
    //       You've been invited to a game night!

    //       Title: ${title}
    //       Date: ${new Date(date).toLocaleString()}
    //       Location: ${location}
    //       Host: ${req.user.name}

    //       Log in to Game Night Manager to respond to this invitation.
    //     `
    //   });
    // }

    res.status(201).json({
      success: true,
      gameNight
    });
  } catch (error) {
    console.error('Error creating game night:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating game night'
    });
  }
});

// Get all game nights for a user (both hosted and invited)
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const gameNights = await GameNight.find({
      $or: [
        { host: req.user.id },
        { 'invitees.user': req.user.id }
      ]
    })
      .populate('host', 'name email')
      .populate('invitees.user', 'name email')
      .sort({ date: 1 });

    res.json({
      success: true,
      gameNights
    });
  } catch (error) {
    console.error('Error fetching game nights:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching game nights'
    });
  }
});

// Get single game night
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const gameNight = await GameNight.findById(req.params.id)
      .populate('host', 'name email')
      .populate('invitees.user', 'name email');

    if (!gameNight) {
      return res.status(404).json({ message: 'Game night not found' });
    }

    // Check if user has permission to view this game night
    const isHost = gameNight.host._id.toString() === req.user._id.toString();
    const isInvited = gameNight.invitees.some(invite =>
      invite.user._id.toString() === req.user._id.toString()
    );

    if (!isHost && !isInvited) {
      return res.status(403).json({ message: 'Not authorized to view this game night' });
    }

    res.json({ gameNight });
  } catch (error) {
    console.error('Error fetching game night:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update game night
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const gameNight = await GameNight.findById(req.params.id);

    if (!gameNight) {
      return res.status(404).json({ message: 'Game night not found' });
    }

    // Check if user is the host
    if (gameNight.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the host can edit game nights' });
    }

    // Update basic fields
    const updatableFields = ['title', 'date', 'location', 'description'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        gameNight[field] = req.body[field];
      }
    });

    // Update invitees if provided
    if (req.body.invitees) {
      // Keep existing accepted/declined invitees
      const existingInvitees = gameNight.invitees.filter(invite =>
        invite.status !== 'pending' &&
        !req.body.invitees.includes(invite.user.toString())
      );

      // Add new invitees
      const newInvitees = req.body.invitees.map(userId => ({
        user: userId,
        status: 'pending'
      }));

      gameNight.invitees = [...existingInvitees, ...newInvitees];
    }

    await gameNight.save();

    // Fetch updated game night with populated fields
    const updatedGameNight = await GameNight.findById(req.params.id)
      .populate('host', 'name email')
      .populate('invitees.user', 'name email');

    res.json({ gameNight: updatedGameNight });
  } catch (error) {
    console.error('Error updating game night:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete game night
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Add logging
    console.log('Delete request received for game night:', req.params.id);
    console.log('User ID:', req.user._id);

    const gameNight = await GameNight.findById(req.params.id);

    if (!gameNight) {
      console.log('Game night not found');
      return res.status(404).json({ message: 'Game night not found' });
    }

    // Check if user is the host
    if (gameNight.host.toString() !== req.user._id.toString()) {
      console.log('Unauthorized delete attempt');
      return res.status(403).json({ message: 'Only the host can delete game nights' });
    }

    await GameNight.findByIdAndDelete(req.params.id);
    console.log('Game night deleted successfully');

    res.json({ message: 'Game night deleted successfully' });
  } catch (error) {
    console.error('Error in delete route:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Respond to game night invitation
router.post('/:id/respond', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { status } = req.body;
    const gameNight = await GameNight.findById(req.params.id);

    if (!gameNight) {
      return res.status(404).json({ message: 'Game night not found' });
    }

    const invitee = gameNight.invitees.find(
      inv => inv.user.toString() === req.user.id
    );

    if (!invitee) {
      return res.status(403).json({ message: 'Not invited to this game night' });
    }

    invitee.status = status;
    await gameNight.save();

    const updatedGameNight = await GameNight.findById(req.params.id)
      .populate('host', 'name email')
      .populate('invitees.user', 'name email');

    res.json({ gameNight: updatedGameNight });
  } catch (error) {
    console.error('Error responding to invitation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 