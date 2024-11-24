const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const express = require('express');
const router = express.Router();

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.NODE_ENV === 'development' ? 'smtp.ethereal.email' : process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.NODE_ENV === 'production',
  auth: {
    user: process.env.NODE_ENV === 'development' ? process.env.ETHEREAL_EMAIL : process.env.EMAIL_USER,
    pass: process.env.NODE_ENV === 'development' ? process.env.ETHEREAL_PASSWORD : process.env.EMAIL_PASS
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Save token to database
    await PasswordReset.create({
      userId: user._id,
      token: token
    });

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
        <p>This link will expire in 1 hour.</p>
      `
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing request' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const resetRequest = await PasswordReset.findOne({ token });
    if (!resetRequest) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(resetRequest.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Delete used token
    await PasswordReset.deleteOne({ _id: resetRequest._id });

    res.json({ message: 'Password successfully reset' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password' });
  }
});

module.exports = router;