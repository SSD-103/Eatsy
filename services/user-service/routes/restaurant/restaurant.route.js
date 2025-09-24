const express = require('express');
const router = express.Router();
const { register, login, getAllRestaurants, getRestaurantByID, updateRestaurantAvailability, getRestaurantAvailability, verifyRestaurant } = require('../../controllers/restaurant/restaurant.controller');
const {protect, authorize} = require('../../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/', getAllRestaurants);
router.patch('/availability', protect, authorize("restaurant"), updateRestaurantAvailability);
router.get('/availability', protect, authorize("restaurant"), getRestaurantAvailability);
router.get('/:id', getRestaurantByID);
router.put('/verify/:id/:adminId', protect, authorize("admin"), verifyRestaurant);

module.exports = router;