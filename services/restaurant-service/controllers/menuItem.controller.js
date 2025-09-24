const MenuItem = require("../models/menuItem.model");
const Category = require("../models/category.model");
const userService = require("../services/user.service");
const winston = require("winston");

// Create Winston logger instance
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs/menu-item.log",
      level: "error",
    }), // For persistent error logs
    new winston.transports.File({
      filename: "logs/menu-item-info.log",
      level: "info",
    }), // For persistent info logs
    new winston.transports.File({ filename: "logs/menu-item-combined.log" }), // For all logs
  ],
});

const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find().populate("category");
    logger.info("Retrieved all menu items successfully", {
      count: menuItems.length,
    });
    res.json(menuItems);
  } catch (error) {
    logger.error("Error retrieving all menu items", { error: error.message });
    res.status(500).json({ message: error.message });
  }
};

const createMenuItem = async (req, res) => {
  const { id } = req.user;
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      logger.warn("Menu item creation failed: Category not found", {
        categoryId: req.body.category,
      });
      return res.status(404).json({ message: "Category not found" });
    }

    const updatedData = {
      ...req.body,
      restaurantID: id,
    };

    const menuItem = await MenuItem.create(updatedData);
    logger.info("Menu item created successfully", {
      menuItemId: menuItem._id,
      restaurantId: id,
    });
    res.status(201).json(menuItem);
  } catch (error) {
    logger.error("Error creating menu item", {
      error: error.message,
      restaurantId: id,
    });
    res.status(500).json({ message: error.message });
  }
};

const getMenuItemByID = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate(
      "category"
    );
    if (!menuItem) {
      logger.info("Menu item retrieval failed: Not found", {
        menuItemId: req.params.id,
      });
      return res.status(404).json({ message: "Menu item not found" });
    }
    logger.info("Retrieved menu item successfully", {
      menuItemId: req.params.id,
    });
    res.json(menuItem);
  } catch (error) {
    logger.error("Error retrieving menu item by ID", {
      menuItemId: req.params.id,
      error: error.message,
    });
    res.status(500).json({ message: error.message });
  }
};

const getMenuItemsByRestaurantID = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await userService.getRestaurantById(id);
    if (!restaurant) {
      logger.warn("Menu items retrieval failed: Restaurant not found", {
        restaurantId: id,
      });
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menuItems = await MenuItem.find({
      restaurantID: req.params.id,
    })
      .populate("category")
      .lean();

    const updatedMenuItems = menuItems.map((item) => ({
      ...item,
      restaurantName: restaurant.name,
      deliveryFee: restaurant.deliveryFee,
    }));

    logger.info("Retrieved menu items by restaurant ID successfully", {
      restaurantId: id,
      count: menuItems.length,
    });
    res.json({ menuItems: updatedMenuItems });
  } catch (error) {
    logger.error("Error retrieving menu items by restaurant ID", {
      restaurantId: req.params.id,
      error: error.message,
    });
    res.status(500).json({ message: error.message });
  }
};

const getMyMenuItems = async (req, res) => {
  const { id } = req.user;
  try {
    const menuItems = await MenuItem.find({
      restaurantID: id,
    }).populate("category");
    logger.info("Retrieved my menu items successfully", {
      restaurantId: id,
      count: menuItems.length,
    });
    res.json(menuItems);
  } catch (error) {
    logger.error("Error retrieving my menu items", {
      restaurantId: id,
      error: error.message,
    });
    res.status(500).json({ message: error.message });
  }
};

const updateMenuItemAvailability = async (req, res) => {
  const { id } = req.user;
  try {
    const restaurant = await userService.getRestaurantById(id);
    if (!restaurant) {
      logger.warn("Update availability failed: Restaurant not found", {
        restaurantId: id,
      });
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      logger.warn("Update availability failed: Menu item not found", {
        menuItemId: req.params.id,
      });
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (menuItem.restaurantID !== restaurant._id.toString()) {
      logger.warn("Update availability failed: Unauthorized access", {
        menuItemId: req.params.id,
        restaurantId: id,
      });
      return res
        .status(403)
        .json({ message: "Unauthorized to update this menu item" });
    }

    menuItem.availability = !menuItem.availability;
    await menuItem.save();
    logger.info("Menu item availability updated successfully", {
      menuItemId: req.params.id,
      restaurantId: id,
      newAvailability: menuItem.availability,
    });
    res.json(menuItem);
  } catch (error) {
    logger.error("Error updating menu item availability", {
      menuItemId: req.params.id,
      restaurantId: id,
      error: error.message,
    });
    res.status(500).json({ message: error.message });
  }
};

const updateMyMenuItem = async (req, res) => {
  const { id } = req.user;
  try {
    const restaurant = await userService.getRestaurantById(id);
    if (!restaurant) {
      logger.warn("Update menu item failed: Restaurant not found", {
        restaurantId: id,
      });
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      logger.warn("Update menu item failed: Menu item not found", {
        menuItemId: req.params.id,
      });
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (menuItem.restaurantID !== restaurant._id.toString()) {
      logger.warn("Update menu item failed: Unauthorized access", {
        menuItemId: req.params.id,
        restaurantId: id,
      });
      return res
        .status(403)
        .json({ message: "Unauthorized to update this menu item" });
    }

    const updatedData = {
      ...req.body,
      restaurantID: id,
    };
    Object.assign(menuItem, updatedData);
    await menuItem.save();
    logger.info("Menu item updated successfully", {
      menuItemId: req.params.id,
      restaurantId: id,
    });
    res.json(menuItem);
  } catch (error) {
    logger.error("Error updating menu item", {
      menuItemId: req.params.id,
      restaurantId: id,
      error: error.message,
    });
    res.status(500).json({ message: error.message });
  }
};

const deleteMyMenuItem = async (req, res) => {
  const { id } = req.user;
  try {
    const restaurant = await userService.getRestaurantById(id);
    if (!restaurant) {
      logger.warn("Delete menu item failed: Restaurant not found", {
        restaurantId: id,
      });
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      logger.warn("Delete menu item failed: Menu item not found", {
        menuItemId: req.params.id,
      });
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (menuItem.restaurantID !== restaurant._id.toString()) {
      logger.warn("Delete menu item failed: Unauthorized access", {
        menuItemId: req.params.id,
        restaurantId: id,
      });
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this menu item" });
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    logger.info("Menu item deleted successfully", {
      menuItemId: req.params.id,
      restaurantId: id,
    });
    res.json({ message: "Menu item deleted" });
  } catch (error) {
    logger.error("Error deleting menu item", {
      menuItemId: req.params.id,
      restaurantId: id,
      error: error.message,
    });
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllMenuItems,
  createMenuItem,
  getMenuItemByID,
  getMenuItemsByRestaurantID,
  getMyMenuItems,
  updateMenuItemAvailability,
  updateMyMenuItem,
  deleteMyMenuItem,
};
