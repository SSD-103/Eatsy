const Customer = require("../../models/customer/customer.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validateCustomerRegister, validateCustomerLogin, validateCustomerId } = require('../../middleware/validation.middleware');

const register = [
  // Validation middleware first
  validateCustomerRegister,
  
  // Controller logic
  async (req, res) => {
    try {
      // Input is already validated and sanitized by middleware
      const { name, email, phone, username, password } = req.body;

      // Safe MongoDB query with validated input
      const existingUser = await Customer.findOne({
        $or: [
          { email: req.body.email },
          { username: req.body.username },
          { phone: req.body.phone }
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          msg: "Customer already exists with provided email, username, or phone",
          field: existingUser.email ? 'email' : existingUser.username ? 'username' : 'phone'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      // Create customer with explicit field assignment
      const newCustomer = new Customer({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        username: req.body.username,
        password: hashedPassword,
      });

      await newCustomer.save();
      
      res.status(201).json({ 
        msg: "Customer registered successfully",
        user: {
          id: newCustomer._id,
          name: newCustomer.name,
          username: newCustomer.username
        }
      });
    } catch (err) {
      console.error('Registration error:', err.message);
      res.status(500).json({ msg: "Server error during registration" });
    }
  }
];

const login = [
  validateCustomerLogin,
  
  async (req, res) => {
    try {
      // Input is already validated and sanitized
      const { username, password } = req.body;

      // Safe single-field query
      const customer = await Customer.findOne({ 
        username: req.body.username 
      });

      if (!customer) {
        return res.status(400).json({ 
          msg: "Invalid username or password" 
        });
      }

      const isMatch = await bcrypt.compare(password, customer.password);
      if (!isMatch) {
        return res.status(400).json({ 
          msg: "Invalid username or password" 
        });
      }

      const token = jwt.sign(
        { 
          id: customer._id,
          username: customer.username,
          type: 'customer'
        },
        process.env.JWT_SECRET,
        { expiresIn: "3h" }
      );

      res.status(200).json({
        token,
        user: {
          id: customer._id,
          name: customer.name,
          username: customer.username,
        },
      });
    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).json({ msg: "Server error during login" });
    }
  }
];

const getCustomerByID = [
  validateCustomerId,
  
  async (req, res) => {
    try {
      // Input is already validated as MongoDB ObjectId
      const customerId = req.params.id;

      const customer = await Customer.findById(customerId).select("-password");
      
      if (!customer) {
        return res.status(404).json({ msg: "Customer not found" });
      }
      
      res.status(200).json({
        success: true,
        customer: customer
      });
    } catch (err) {
      console.error('Get customer error:', err.message);
      res.status(500).json({ msg: "Server error" });
    }
  }
];

module.exports = {
  register,
  login,
  getCustomerByID,
};