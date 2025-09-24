const express = require("express");
const router = express.Router();

const {
  getAllMenuItems,
  createMenuItem,
  getMenuItemByID,
  getMenuItemsByRestaurantID,
  getMyMenuItems,
  updateMenuItemAvailability,
  updateMyMenuItem,
  deleteMyMenuItem
} = require("../controllers/menuItem.controller");

const { protect, authorize } = require("../middleware/auth.middleware");

// Public Routes
router.get("/", getAllMenuItems); // Anyone can view all menu items

// This MUST come before /restaurant/:id
router.get("/restaurant/my-menu-items", protect, authorize("restaurant"), getMyMenuItems);

router.get("/restaurant/:id", getMenuItemsByRestaurantID); // View menu by restaurant
router.get("/:id", getMenuItemByID); // View single menu item

// Protected Routes - Restaurant Only
router.post("/", protect, authorize("restaurant"), createMenuItem);
router.put("/restaurant/my-menu-items/:id", protect, authorize("restaurant"), updateMyMenuItem);
router.delete("/restaurant/my-menu-items/:id", protect, authorize("restaurant"), deleteMyMenuItem);
router.put("/availability/:id", protect, authorize("restaurant"), updateMenuItemAvailability);


module.exports = router;
