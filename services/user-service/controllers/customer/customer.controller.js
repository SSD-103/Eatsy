const Customer = require("../../models/customer/customer.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator"); // Added for input validation
const crypto = require("crypto"); // For generating random refresh tokens

const register = async (req, res) => {
  try {
    const { name, email, phone, username, password } = req.body;

    // Input validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }
    if (!validator.isMobilePhone(phone)) {
      return res.status(400).json({ msg: "Invalid phone number" });
    }
    if (!validator.isLength(username, { min: 3, max: 20 })) {
      return res.status(400).json({ msg: "Username must be between 3 and 20 characters" });
    }
    if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
      return res.status(400).json({ msg: "Password must be at least 8 characters with lowercase, uppercase, number, and symbol" });
    }

    const existingUser = await Customer.findOne({
      $or: [{ email }, { username }, { phone }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({
          msg: "Customer already exists with provided email, username, or phone",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = new Customer({
      name,
      email,
      phone,
      username,
      password: hashedPassword,
    });

    await newCustomer.save();
    res.status(201).json({ msg: "Customer registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!validator.isLength(username, { min: 3, max: 20 })) {
      return res.status(400).json({ msg: "Invalid username" });
    }
    if (!validator.isLength(password, { min: 8 })) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const customer = await Customer.findOne({ username });
    if (!customer)
      return res.status(400).json({ msg: "Invalid username or password" });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid username or password" });

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { id: customer._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generate refresh token (opaque random string)
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);

    // Add to user's refreshTokens array (multi-device)
    customer.refreshTokens.push(hashedRefresh);
    await customer.save();

    // Set HTTPOnly cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/api/customer/refresh", // Restrict to refresh endpoint
    });

    res.status(200).json({
      user: {
        id: customer._id,
        name: customer.name,
        username: customer.username,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "No refresh token provided" });
    }

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);

    // Find user with matching hashed refresh token
    const customer = await Customer.findOne({
      refreshTokens: hashedRefresh,
    });

    if (!customer) {
      return res.status(403).json({ msg: "Invalid refresh token" });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: customer._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Set new access token cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ msg: "Token refreshed" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const hashedRefresh = await bcrypt.hash(refreshToken, 10);

      // Remove the specific refresh token from the array (server-side invalidation)
      await Customer.updateOne(
        { refreshTokens: hashedRefresh },
        { $pull: { refreshTokens: hashedRefresh } }
      );
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ msg: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getCustomerByID = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select("-password -refreshTokens");
    if (!customer) {
      return res.status(404).json({ msg: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getCustomerByID,
};