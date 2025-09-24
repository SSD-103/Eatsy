// Updated customer.route.js (add refresh and logout routes, rate limiting on login)
const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, getCustomerByID } = require('../../controllers/customer/customer.controller');
const {loginLimiter} = require('../../middleware/rateLimiter.middleware');

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/:id', getCustomerByID);

module.exports = router;