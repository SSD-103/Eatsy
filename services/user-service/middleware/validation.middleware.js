const { body, param, validationResult } = require("express-validator");
const sanitize = require("mongo-sanitize");

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove MongoDB operators from all inputs
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  next();
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      msg: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Customer registration validation
const validateCustomerRegister = [
  body("name")
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("phone")
    .isString()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Valid phone number required"),
  body("username")
    .isString()
    .trim()
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username must be 3-20 alphanumeric characters"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  sanitizeInput, // Remove MongoDB operators
  handleValidationErrors,
];

// Customer login validation
const validateCustomerLogin = [
  body("username")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
  sanitizeInput,
  handleValidationErrors,
];

// Customer ID parameter validation
const validateCustomerId = [
  param("id").isMongoId().withMessage("Valid customer ID required"),
  sanitizeInput,
  handleValidationErrors,
];

const validateRestaurantRegister = [
  // Basic fields (similar to customer)
  body("name")
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Restaurant name must be 2-100 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("phone")
    .isString()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Valid phone number required"),
  body("username")
    .isString()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Username must be 3-30 alphanumeric characters or hyphens"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  // Restaurant-specific fields
  body("address")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Address must be 5-200 characters"),

  // Location coordinates validation
  body("location.coordinates")
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage("Location must be an array of exactly 2 coordinates"),
  body("location.coordinates.0") // Longitude
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("location.coordinates.1") // Latitude
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  // Optional fields with basic validation
  body("profileImage")
    .optional()
    .isURL()
    .withMessage("Profile image must be a valid URL"),
  body("coverImage")
    .optional()
    .isURL()
    .withMessage("Cover image must be a valid URL"),
  body("owner")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Owner name cannot exceed 100 characters"),
  body("businessRegNo")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage("Business registration number must be 5-50 characters"),

  // Block unexpected fields (object pollution prevention)
  body()
    .custom((value, { req }) => {
      const allowedFields = [
        "name",
        "email",
        "phone",
        "username",
        "password",
        "profileImage",
        "address",
        "location",
        "owner",
        "businessRegNo",
        "coverImage",
      ];

      const receivedFields = Object.keys(req.body);
      const unexpectedFields = receivedFields.filter(
        (field) => !allowedFields.includes(field)
      );

      if (unexpectedFields.length > 0) {
        throw new Error(`Unexpected fields: ${unexpectedFields.join(", ")}`);
      }

      return true;
    })
    .withMessage("Only allowed fields permitted"),

  sanitizeInput,
  handleValidationErrors,
];

const validateRestaurantLogin = [
  body("username")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
  sanitizeInput,
  handleValidationErrors,
];

const validateRestaurantId = [
  param("id").isMongoId().withMessage("Valid restaurant ID required"),
  param("adminId")
    .optional()
    .isMongoId()
    .withMessage("Valid admin ID required"),
  sanitizeInput,
  handleValidationErrors,
];

module.exports = {
  validateCustomerRegister,
  validateCustomerLogin,
  validateCustomerId,

  validateRestaurantRegister,
  validateRestaurantLogin,
  validateRestaurantId,
  sanitizeInput,
};
