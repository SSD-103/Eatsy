const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const cookieParser = require('cookie-parser'); // Added for handling cookies
const rateLimit = require('express-rate-limit'); // Added for general rate limiting

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env' });
}

const app = express();
const PORT = process.env.PORT || 3000;

// General rate limiter (e.g., 100 requests per 15 minutes per IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

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
app.use(cookieParser());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('Welcome to the User Service'));
app.get('/api/health', (req, res) => res.json({ status: 'OK', service: 'User Service' }));

const customerRoutes = require("./routes/customer/customer.route");
const customerLocationRoutes = require("./routes/customer/customerLocation.route");
const restaurantRoutes = require("./routes/restaurant/restaurant.route");
const deliveryPersonRoutes = require("./routes/deliveryPerson/deliveryPerson.route");
const adminRoutes = require("./routes/admin/admin.route");

app.use("/api/customer", customerRoutes);
app.use("/api/customer-location", customerLocationRoutes);
app.use("/api/deliveryPerson", deliveryPersonRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/admin", adminRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    const server = http.createServer(app);
    server.setTimeout(10 * 1000);
    server.keepAliveTimeout = 5 * 1000;
    server.headersTimeout = 6 * 1000;

    server.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
  })
  .catch(err => console.log(err));
