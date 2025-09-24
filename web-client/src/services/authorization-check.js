import axios from "axios";
import { userAPI } from "./user-service"; // your API endpoints

/**
 * Checks if the current user matches the expected role
 * @param {string} expectedRole - 'customer' | 'restaurant' | 'delivery'
 * @returns {Promise<boolean>} - true if role matches, false otherwise
 */
export const verifyUserRole = async (expectedRole) => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return false;

    const { id } = JSON.parse(storedUser);

    // Helper to wrap requests and return null if 404
    const safeGet = async (url) => {
      try {
        const res = await axios.get(url);
        return res?.status === 200 ? res.data : null;
      } catch (err) {
        if (err.response && err.response.status === 404) {
          return null; // expected "not found" → ignore
        }
        throw err; // rethrow unexpected errors
      }
    };

    // Call in parallel
    const [customer, restaurant, delivery] = await Promise.all([
      safeGet(userAPI.getCustomerByID(id)),
      safeGet(userAPI.getRestaurantByID(id)),
      safeGet(userAPI.getDeliveryPersonById(id)),
    ]);

    // Determine actual role
    let actualRole = null;
    if (customer) actualRole = "customer";
    else if (restaurant) actualRole = "restaurant";
    else if (delivery) actualRole = "delivery";

    return actualRole === expectedRole;
  } catch (err) {
    console.error("Role verification error:", err);
    return false;
  }
};

/**
 * Securely determines the role of the logged-in user
 * @returns {Promise<string|null>} - 'customer' | 'restaurant' | 'delivery' | 'admin' | null if not found
 */
export const getUserRole = async () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;

    const { id } = JSON.parse(storedUser);

    const safeGet = async (url) => {
      try {
        const res = await axios.get(url);
        return res.status === 200 ? true : false;
      } catch (err) {
        if (err.response?.status === 404) return false;
        throw err;
      }
    };

    const [isCustomer, isRestaurant, isDelivery, isAdmin] = await Promise.all([
      safeGet(userAPI.getCustomerByID(id)),
      safeGet(userAPI.getRestaurantByID(id)),
      safeGet(userAPI.getDeliveryPersonById(id)),
    ]);

    if (isCustomer) return "customer";
    if (isRestaurant) return "restaurant";
    if (isDelivery) return "delivery";

    return null;
  } catch (err) {
    console.error("Error fetching user role:", err.message);
    return null;
  }
};