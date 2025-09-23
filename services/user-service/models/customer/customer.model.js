const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    phone: { type: String, unique: true },
    username: { type: String, unique: true },
    password: { type: String },
    googleId: { type: String },
    profileImage: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);