import axios from "axios";
import { userAPI } from "./user-service"; // your API endpoints

/**
 * Checks if the current user matches the expected role
 * @param {string} expectedRole - 'customer' | 'restaurant' | 'delivery'
 * @returns {Promise<boolean>} - true if role matches, false otherwise
 */
export const verifyUserRole = async () => {
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
    const [admin] = await Promise.all([
      safeGet(userAPI.GetAdminByID(id)),
    ]);

    return admin;
  } catch (err) {
    console.error("Role verification error:", err);
    return false;
  }
};