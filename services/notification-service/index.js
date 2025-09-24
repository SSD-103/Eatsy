const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const { apiLimiter } = require('./middleware/rateLimiter');

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env' });
}

const app = express();
const PORT = process.env.PORT || 3000;


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

app.get('/', (req, res) => {
  res.send('Welcome to the Notification Service');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'Notification Service' });
});

const notificationRouter = require('./routes/notification.route.js');
app.use('/api/notifications', notificationRouter);


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to DB");

    const server = http.createServer(app);
    server.setTimeout(10 * 1000);
    server.keepAliveTimeout = 5 * 1000;
    server.headersTimeout = 6 * 1000;

    server.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));
  })
  .catch(err => console.log("DB connection error:", err));
