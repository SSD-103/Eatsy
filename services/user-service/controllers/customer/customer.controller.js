const Customer = require("../../models/customer/customer.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const winston = require("winston");

// Create Winston logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/security.log', level: 'error' }) // For persistent error logs
  ],
});

const register = async (req, res) => {
  try {
    const { name, email, phone, username, password } = req.body;

    const existingUser = await Customer.findOne({
      $or: [{ email }, { username }, { phone }],
    });
    if (existingUser) {
      logger.info('Registration attempt failed: User already exists', { email, username, phone });
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
    logger.info('Customer registered successfully', { customerId: newCustomer._id, username });
    res.status(201).json({ msg: "Customer registered successfully" });
  } catch (err) {
    logger.error('Error during customer registration', { error: err.message });
    res.status(500).json({ msg: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const customer = await Customer.findOne({ username });
    if (!customer) {
      logger.warn('Login attempt failed: Invalid username', { username });
      return res.status(400).json({ msg: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      logger.warn('Login attempt failed: Invalid password', { username });
      return res.status(400).json({ msg: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: customer._id },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );    

    logger.info('Customer login successful', { customerId: customer._id, username });
    res.status(200).json({
      token,
      user: {
        id: customer._id,
        name: customer.name,
        username: customer.username,
      },
    });
  } catch (err) {
    logger.error('Error during customer login', { error: err.message });
    res.status(500).json({ msg: err.message });
  }
};

const getCustomerByID = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select("-password");
    if (!customer) {
      logger.info('Customer retrieval failed: Not found', { customerId: req.params.id });
      return res.status(404).json({ msg: "Customer not found" });
    }
    logger.info('Customer retrieved successfully', { customerId: req.params.id });
    res.status(200).json(customer);
  } catch (err) {
    logger.error('Error during customer retrieval', { customerId: req.params.id, error: err.message });
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  register,
  login,
  getCustomerByID,
};