const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login, getCustomerByID } = require('../../controllers/customer/customer.controller');

// Initialize Passport (require the config)
require('../../config/passport');  // Adjust path if needed

// Existing routes
router.post('/register', register);
router.post('/login', login);
router.get('/:id', getCustomerByID);

// New OAuth routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '3h' });
    // Redirect to frontend with token (adjust FRONTEND_URL in .env)
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router;