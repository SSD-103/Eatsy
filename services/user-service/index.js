const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env' });
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
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
