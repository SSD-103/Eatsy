const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://localhost:4002";
const axios = require('../common/safeAxios');
const mongoose = require('mongoose');

const getMyOrders = async (userId) => {
    try {
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid userId passed to getMyOrders:', userId);
            throw new Error('Invalid user id');
        }
        const response = await axios.get(`${ORDER_SERVICE_URL}/order/restaurant/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw new Error("Failed to fetch orders");
    }
};

module.exports = {
    getMyOrders,
};