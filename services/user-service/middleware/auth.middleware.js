const jwt = require("jsonwebtoken");
const axios = require("axios");

const Admin = require("../models/admin/admin.model");
const Customer = require("../models/customer/customer.model");
const Restaurant = require("../models/restaurant/restaurant.model");
const DeliveryPerson = require("../models/deliveryPerson/deliveryPerson.model");  

/**
 * Middleware: Authenticate JWT token
 */
exports.protect = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains user ID and possibly other info
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

/**
 * Middleware: Authorize user based on role via direct DB model lookup
 * @param  {...string} allowedRoles - Roles allowed for the route
 */
exports.authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    const { id } = req.user;

    if (!id) {
      return res.status(401).json({ message: "Unauthorized: Invalid user data" });
    }

    try {
      // Try to find the user in each role-specific model
      const [customer, restaurant, delivery, admin] = await Promise.all([
        Customer.findById(id),
        Restaurant.findById(id),
        DeliveryPerson.findById(id),
        Admin.findById(id),
      ]);

      // Determine the user's role based on where they were found
      let actualRole = null;
      if (customer) actualRole = "customer";
      else if (restaurant) actualRole = "restaurant";
      else if (delivery) actualRole = "delivery";
      else if (admin) actualRole = "admin";

      if (!actualRole) {
        return res.status(403).json({ message: "Forbidden: Role not found" });
      }

      // Attach role to request object
      req.user.role = actualRole;

      // Check if user's role is allowed for this route
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
