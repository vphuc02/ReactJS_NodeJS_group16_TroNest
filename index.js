require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const { connectDB } = require('./configs/database.config');
const { PORT } = require('./configs/system.config');
const { attachUser } = require('./middlewares/auth.middleware');
const { csrfProtection, securityHeaders } = require('./middlewares/security.middleware');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

const clientRouter = require('./routers/client/index.route');
const landlordRouter = require('./routers/landlord/index.route');
const adminRouter = require('./routers/admin/index.route');

const app = express();

// CORS Configuration for React Frontend
app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép không có origin (curl, same-origin) hoặc bất kỳ port nào trên localhost/127.0.0.1 (5173, 5174, 3000...)
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'Accept', 'X-Requested-With']
  })
);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Basic security headers and CSRF protection
app.use(securityHeaders);
app.use(csrfProtection);

// Static Files (Uploads and assets)
app.use(express.static(path.join(__dirname, 'public')));

// Global Middleware to attach current user to requests
app.use(attachUser);

// REST API Routers
app.use('/admin', adminRouter);
app.use('/landlord', landlordRouter);
app.use('/', clientRouter);
app.use('/api/geo', require('./routes/api/geo'));
app.use('/api/geo', require('./routes/api/nearby'));

// Central error handlers (Pure JSON)
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` TroNest REST API Server is running at http://localhost:${PORT}`);
    console.log(` React Frontend:  http://localhost:5173`);
    console.log(`===============================================`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
