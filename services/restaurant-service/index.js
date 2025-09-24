const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require('mongoose');
const http = require('http');
const { apiLimiter } = require('./middleware/rateLimiter');

if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
} else {
  dotenv.config({ path: ".env" });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares

// Dynamic CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_WHITELIST ? process.env.CORS_WHITELIST.split(',') : ['http://localhost:3000', 'http://127.0.0.1:3000'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Apply global limiter to all API routes
app.use("/api", apiLimiter);

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Restaurant Service");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", service: "Restaurant Service" });
});

// Importing routes
const categoryRoutes = require("./routes/category.route.js");
const menuItemRoutes = require("./routes/menuItem.route.js");
const restaurantUserRoutes = require("./routes/restaurant-user.route.js");
const restaurantOrderRoutes = require("./routes/restaurant-order.route.js");

// Using routes
app.use("/api/category", categoryRoutes);
app.use("/api/menu", menuItemRoutes);
app.use("/api/restaurant", restaurantUserRoutes);
app.use("/api/orders", restaurantOrderRoutes);

// MongoDB connection and server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    // Create HTTP server manually
    const server = http.createServer(app);

    // Set connection timeout and keep-alive limits
    server.setTimeout(10 * 1000);       // 10 seconds per request
    server.keepAliveTimeout = 5 * 1000; // 5 seconds idle
    server.headersTimeout = 6 * 1000;   // must be >= keepAliveTimeout

    server.listen(PORT, () => {
      console.log(`Restaurant Service running on port ${PORT}`);
    });

  })
  .catch((err) => console.log(err));
