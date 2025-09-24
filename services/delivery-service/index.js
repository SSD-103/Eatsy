const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const { apiLimiter } = require("./middleware/rateLimiter");
const deliveryRoutes = require("./routes/delivery.routes");
const socketHandler = require("./socket");

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env' });
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});


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

app.get("/", (req, res) => {
  res.send("Welcome to the Delivery Service");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", service: "Delivery Service" });
});

app.use("/api/delivery", deliveryRoutes);

socketHandler(io);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

server.setTimeout(10 * 1000);
server.keepAliveTimeout = 5 * 1000;
server.headersTimeout = 6 * 1000;

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Delivery Service running on port ${PORT}`));
