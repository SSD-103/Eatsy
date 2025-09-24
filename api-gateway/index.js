const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();

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

app.get('/', (req, res) => {
  res.send('API Gateway is running!');
});

// Proxy rules
app.use('/user', createProxyMiddleware({ target: 'http://user-service:3000', changeOrigin: true, pathRewrite: { '^/user': '/api' } }));
app.use('/restaurant', createProxyMiddleware({ target: 'http://restaurant-service:3000', changeOrigin: true, pathRewrite: { '^/restaurant': '/api' } }));
app.use('/order', createProxyMiddleware({ target: 'http://order-service:3000', changeOrigin: true, pathRewrite: { '^/order': '/api' } }));
app.use('/delivery', createProxyMiddleware({ target: 'http://delivery-service:3000', changeOrigin: true, pathRewrite: { '^/delivery': '/api' } }));
app.use('/payment', createProxyMiddleware({ target: 'http://payment-service:3000', changeOrigin: true, pathRewrite: { '^/payment': '/api' } }));
app.use('/notification', createProxyMiddleware({ target: 'http://notification-service:3000', changeOrigin: true, pathRewrite: { '^/notification': '/api' } }));

// Health check
app.get('/health', (req, res) => {
  res.send('API Gateway is running!');
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
