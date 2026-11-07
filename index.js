require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
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
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép không có origin (curl, same-origin, mobile)
      if (!origin) return callback(null, true);

      // Cho phép các cổng trên localhost/127.0.0.1 (5173, 5174, 3000...)
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Cho phép domain production được cấu hình qua ALLOWED_ORIGINS
      if (allowedOrigins.includes(origin)) {
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

// Serve React production build if available
const frontendDistPath = path.join(__dirname, 'frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

// Global Middleware to attach current user to requests
app.use(attachUser);

// SPA Browser Navigation Handler for React sub-routes in production:
// Khi trình duyệt mở hoặc tải lại các URL (/login, /rooms, /admin/dashboard, /landlord/dashboard...)
// trả về index.html để React Router điều hướng, còn các lệnh gọi API với Accept: application/json
// sẽ đi tiếp tới các Router API phía dưới.
if (process.env.NODE_ENV !== 'test' && fs.existsSync(frontendDistPath)) {
  app.use((req, res, next) => {
    const isNavigation =
      req.headers['sec-fetch-mode'] === 'navigate' ||
      req.accepts(['html', 'json']) === 'html';
    const isStaticFile = Boolean(path.extname(req.path));

    if (req.method === 'GET' && isNavigation && !isStaticFile) {
      return res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
    next();
  });
}

// REST API Routers
app.use('/admin', adminRouter);
app.use('/landlord', landlordRouter);
app.use('/', clientRouter);
app.use('/api/geo', require('./routes/api/geo'));
app.use('/api/geo', require('./routes/api/nearby'));

// SPA Fallback cuối cùng cho client-side routing (HTML requests chưa khớp)
if (process.env.NODE_ENV !== 'test' && fs.existsSync(frontendDistPath)) {
  app.use((req, res, next) => {
    if (req.method === 'GET' && req.accepts('html')) {
      return res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
    next();
  });
}

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
