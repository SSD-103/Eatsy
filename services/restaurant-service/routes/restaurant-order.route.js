const express = require('express');
const router = express.Router();

const {
  getMyTopOrders,
  getMyRecentOrders
} = require('../controllers/restaurant-order.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

// 🔒 Protected - Only accessible by authenticated restaurant users
router.get('/top', protect, authorize("restaurant"), getMyTopOrders);
router.get('/recent', protect, authorize("restaurant"), getMyRecentOrders);

module.exports = router;
