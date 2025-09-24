const jwt = require("jsonwebtoken");
const axios = require("axios");

const BASE_URL = process.env.USER_SERVICE_URL // adjust if needed

/**
 * Middleware: Authenticate JWT token
 */
exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains user ID and possibly other info
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

/**
 * Middleware: Authorize user based on role via remote service lookup
 * @param  {...string} allowedRoles - Roles allowed for the route
 */
exports.authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    const { id } = req.user;

    if (!id) {
      return res.status(401).json({ message: "Unauthorized: Invalid user data" });
    }

    // Helper to safely fetch user role info
    const safeGet = async (url) => {
      try {
        const res = await axios.get(url);
        return res.status === 200 ? true : false;
      } catch (err) {
        if (err.response && err.response.status === 404) return false;
        console.error(`Error calling ${url}:`, err.message);
        throw new Error("Failed to fetch user role data");
      }
    };

    try {
      // Call each microservice to check for user role
      const [isCustomer, isRestaurant, isDelivery, isAdmin] = await Promise.all([
        safeGet(`${BASE_URL}/customer/${id}`),
        safeGet(`${BASE_URL}/restaurant/${id}`),
        safeGet(`${BASE_URL}/deliveryPerson/${id}`),
        safeGet(`${BASE_URL}/admin/${id}`),
      ]);

      let actualRole = null;
      if (isCustomer) actualRole = "customer";
      else if (isRestaurant) actualRole = "restaurant";
      else if (isDelivery) actualRole = "delivery";
      else if (isAdmin) actualRole = "admin";

      if (!actualRole) {
        return res.status(403).json({ message: "Forbidden: Role not found" });
      }

      // Attach role to request for downstream use
      req.user.role = actualRole;
      if (!allowedRoles.includes(actualRole)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }
      next();
    } catch (err) {
      console.error("Authorization error:", err.message);
      return res.status(500).json({ message: "Server error during authorization" });
    }
  };
};
