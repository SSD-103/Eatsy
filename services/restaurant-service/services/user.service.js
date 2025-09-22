const axios = require('../common/safeAxios');
const mongoose = require('mongoose');

const USER_SERVICE_BASE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4000/api';

const getRestaurantById = async (restaurantID) => {
  try {
    if (!restaurantID || !mongoose.Types.ObjectId.isValid(restaurantID)) {
      console.error('Invalid restaurantID passed to getRestaurantById:', restaurantID);
      return null;
    }
    const response = await axios.get(`${USER_SERVICE_BASE_URL}/restaurant/${restaurantID}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch customer from user-service:', error);
    return null;
  }
};

const getAllRestaurants = async () => {
  try {
    const response = await axios.get(`${USER_SERVICE_BASE_URL}/restaurant`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch customer from user-service:', error);
    return null;
  }
};

module.exports = {
  getRestaurantById,
  getAllRestaurants
};