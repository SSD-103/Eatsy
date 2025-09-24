const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const { apiLimiter } = require('./middleware/rateLimiter');
const initCommissionSetting = require('./startup/commisionSetting.startup.js');

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env' });
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Apply global limiter to all API routes
app.use("/api", apiLimiter);

app.get('/', (req, res) => res.send('Welcome to the Payment Service'));
app.get('/api/health', (req, res) => res.json({ status: 'OK', service: 'Payment Service' }));

const paymentRouter = require("./routes/payment.route.js");
const paymentOrderRouter = require("./routes/payment-order.route.js");
const cardRouter = require("./routes/card.route.js");
const commissionSettingRouter = require("./routes/commissionSetting.route.js");
const paybackRouter = require("./routes/payback.route.js");

app.use('/api/payment', paymentRouter);
app.use('/api/payment-order', paymentOrderRouter);
app.use('/api/card', cardRouter);
app.use('/api/commission-setting', commissionSettingRouter);
app.use('/api/payback', paybackRouter);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to DB");

    const server = http.createServer(app);

    // Timeout & keep-alive settings
    server.setTimeout(10 * 1000);       // 10s request timeout
    server.keepAliveTimeout = 5 * 1000; // 5s idle
    server.headersTimeout = 6 * 1000;

    server.listen(PORT, () => {
      initCommissionSetting();
      console.log(`Payment Service running on port ${PORT}`);
    });
  })
  .catch(err => console.log("DB connection error:", err));
