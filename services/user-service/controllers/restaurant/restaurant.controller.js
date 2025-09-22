const Restaurant = require("../../models/restaurant/restaurant.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { 
  validateRestaurantRegister, 
  validateRestaurantLogin, 
  validateRestaurantId,
  sanitizeInput
} = require('../../middleware/validation.middleware');

const register = [
  validateRestaurantRegister, // Validation first
  
  async (req, res) => {
    try {
      // Input is validated and sanitized by middleware
      const { name, email, phone, username, password, profileImage, address, location, owner, businessRegNo, coverImage } = req.body;

      // Safe MongoDB query with explicit field access
      const existingRestaurant = await Restaurant.findOne({
        $or: [
          { email: req.body.email },
          { phone: req.body.phone },
          { username: req.body.username }
        ]
      });

      if (existingRestaurant) {
        return res.status(400).json({
          msg: "Restaurant already exists with provided email, phone, or username",
          field: existingRestaurant.email ? 'email' : existingRestaurant.phone ? 'phone' : 'username'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      // Explicit field assignment (no object pollution)
      const newRestaurant = new Restaurant({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        username: req.body.username,
        password: hashedPassword,
        profileImage: req.body.profileImage || '',
        address: req.body.address || '',
        location: req.body.location || { type: 'Point', coordinates: [0, 0] },
        owner: req.body.owner || '',
        businessRegNo: req.body.businessRegNo || '',
        coverImage: req.body.coverImage || '',
        availability: false,
        accountStatus: 'pending'
      });

      await newRestaurant.save();
      
      res.status(201).json({ 
        msg: "Restaurant registered successfully",
        restaurant: {
          id: newRestaurant._id,
          name: newRestaurant.name,
          username: newRestaurant.username,
          email: newRestaurant.email
        }
      });
    } catch (err) {
      console.error('Restaurant registration error:', err.message);
      res.status(500).json({ msg: "Server error during registration" });
    }
  }
];

const login = [
  validateRestaurantLogin,
  
  async (req, res) => {
    try {
      const { username, password } = req.body;

      // Safe single-field query
      const restaurant = await Restaurant.findOne({ 
        username: req.body.username 
      }).select('+password'); // Explicitly include password

      if (!restaurant) {
        return res.status(400).json({ 
          msg: "Invalid username or password" 
        });
      }

      const isMatch = await bcrypt.compare(password, restaurant.password);
      if (!isMatch) {
        return res.status(400).json({ 
          msg: "Invalid username or password" 
        });
      }

      const token = jwt.sign(
        { 
          id: restaurant._id,
          username: restaurant.username,
          type: 'restaurant'
        },
        process.env.JWT_SECRET,
        { expiresIn: "3h" }
      );

      // Exclude password from response
      const { password: _, ...safeRestaurant } = restaurant.toObject();

      res.status(200).json({
        token,
        user: {
          id: restaurant._id,
          username: restaurant.username,
          name: restaurant.name,
          availability: restaurant.availability,
          accountStatus: restaurant.accountStatus,
        },
      });
    } catch (err) {
      console.error('Restaurant login error:', err.message);
      res.status(500).json({ msg: "Server error during login" });
    }
  }
];

const getAllRestaurants = [
  // No body validation needed for GET
  sanitizeInput, // Still sanitize query params if any
  
  async (req, res) => {
    try {
      // Optional: Add query parameter validation for filtering
      const { verified, available } = req.query;
      
      let filter = {};
      if (verified === 'true') filter.verifiedBy = { $ne: null };
      if (available === 'true') filter.availability = true;
      
      const restaurants = await Restaurant.find(filter)
        .select('-password') // Exclude sensitive fields
        .sort({ name: 1 });
      
      res.status(200).json({
        success: true,
        count: restaurants.length,
        restaurants
      });
    } catch (err) {
      console.error('Get restaurants error:', err.message);
      res.status(500).json({ msg: "Server error" });
    }
  }
];

const getRestaurantByID = [
  validateRestaurantId, // Validates req.params.id
  
  async (req, res) => {
    try {
      const restaurantId = req.params.id; // Already validated as ObjectId

      const restaurant = await Restaurant.findById(restaurantId)
        .populate("verifiedBy", "name email")
        .select('-password'); // Exclude password

      if (!restaurant) {
        return res.status(404).json({ msg: "Restaurant not found" });
      }
      
      res.status(200).json({
        success: true,
        restaurant
      });
    } catch (err) {
      console.error('Get restaurant error:', err.message);
      res.status(500).json({ msg: "Server error" });
    }
  }
];

const updateRestaurantAvailability = [
  // No body params, just validate user from auth middleware
  sanitizeInput,
  
  async (req, res) => {
    try {
      const { id } = req.user; // From JWT/auth middleware (already validated)

      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Toggle availability (boolean validation not needed)
      restaurant.availability = !restaurant.availability;
      await restaurant.save();

      res.json({
        success: true,
        message: `Restaurant ${restaurant.availability ? 'activated' : 'deactivated'}`,
        availability: restaurant.availability
      });
    } catch (err) {
      console.error('Update availability error:', err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
];

const getRestaurantAvailability = [
  sanitizeInput,
  
  async (req, res) => {
    try {
      const { id } = req.user; // From auth middleware

      const restaurant = await Restaurant.findById(id)
        .select('availability');
        
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      
      res.json({ 
        success: true,
        availability: restaurant.availability 
      });
    } catch (err) {
      console.error('Get availability error:', err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
];

const verifyRestaurant = [
  validateRestaurantId, // Validates both id and adminId params
  
  async (req, res) => {
    try {
      const { id: restaurantId, adminId } = req.params; // Both validated as ObjectIds

      // Safe update with explicit fields
      const restaurant = await Restaurant.findByIdAndUpdate(
        restaurantId,
        { 
          verifiedBy: mongoose.Types.ObjectId(adminId),
          accountStatus: 'verified'
        },
        { 
          new: true, 
          runValidators: true // Enforce schema validation
        }
      ).select('-password');

      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      res.json({ 
        success: true,
        verified: true, 
        verifiedBy: restaurant.verifiedBy,
        accountStatus: restaurant.accountStatus 
      });
    } catch (err) {
      console.error('Verify restaurant error:', err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
];

module.exports = {
  register,
  login,
  getAllRestaurants,
  getRestaurantByID,
  updateRestaurantAvailability,
  getRestaurantAvailability,
  verifyRestaurant
};