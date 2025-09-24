const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: { 
    type: String, 
    unique: true, 
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String, 
    unique: true, 
    required: [true, 'Phone is required'],
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  username: { 
    type: String, 
    unique: true, 
    required: [true, 'Username is required'],
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  profileImage: { 
    type: String,
    default: "",
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\//.test(v);
      },
      message: 'Profile image must be a valid URL'
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: false
    },
    coordinates: {
      type: [Number],
      required: false,
      validate: {
        validator: function(coords) {
          if (!coords || !Array.isArray(coords) || coords.length !== 2) return false;
          const [lng, lat] = coords;
          return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
        },
        message: 'Coordinates must be [longitude, latitude] within valid ranges'
      }
    }
  },
  availability: { 
    type: Boolean, 
    default: false 
  },
  owner: { 
    type: String,
    trim: true,
    maxlength: [100, 'Owner name cannot exceed 100 characters']
  },
  businessRegNo: { 
    type: String,
    trim: true,
    maxlength: [50, 'Business registration number cannot exceed 50 characters']
  },
  coverImage: {
    type: String,
    default: "",
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\//.test(v);
      },
      message: 'Cover image must be a valid URL'
    }
  },
  verifiedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Admin",
    default: null
  },
  accountStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'suspended', 'rejected'],
    default: 'pending' 
  },
  rating: { 
    type: Number, 
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  deliveryFee: { 
    type: Number, 
    default: 0,
    min: [0, 'Delivery fee cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.password; return ret; } },
  toObject: { virtuals: true, transform: (doc, ret) => { delete ret.password; return ret; } }
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);