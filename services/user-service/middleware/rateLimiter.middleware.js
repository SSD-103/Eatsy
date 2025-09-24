const rateLimit = require('express-rate-limit');

// Rate limiter for login (e.g., 5 attempts per IP per minute to prevent credential stuffing)
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts from this IP, please try again after a minute',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter };