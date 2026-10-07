require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { connectDB } = require('./configs/database.config');
const { PORT, ROLES, ROOM_DEFAULTS, ROOM_DISTRICTS, ROOM_STATUS, USER_STATUS } = require('./configs/system.config');
const { attachUser } = require('./middlewares/auth.middleware');
const { csrfProtection, securityHeaders } = require('./middlewares/security.middleware');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const { VN_PROVINCES } = require('./helpers/geo.helper');

const clientRouter = require('./routers/client/index.route');
const landlordRouter = require('./routers/landlord/index.route');
const adminRouter = require('./routers/admin/index.route');

const app = express();

app.locals.USER_STATUS = USER_STATUS;
app.locals.ROOM_STATUS = ROOM_STATUS;
app.locals.ROLES = ROLES;
app.locals.ROOM_DEFAULTS = ROOM_DEFAULTS;
app.locals.ROOM_DISTRICTS = ROOM_DISTRICTS;
app.locals.VN_PROVINCES = VN_PROVINCES;

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Basic security headers and CSRF protection
app.use(securityHeaders);
app.use(csrfProtection);

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// View Engine Setup (Pug)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Global Middleware to attach current user to views and requests
app.use(attachUser);

// Routers
app.use('/admin', adminRouter);
app.use('/landlord', landlordRouter);
app.use('/', clientRouter);
app.use('/api/geo', require('./routes/api/geo'));

// Central error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` TroNest Server is running at http://localhost:${PORT}`);
    console.log(` Client Portal:    http://localhost:${PORT}`);
    console.log(` Landlord Portal:  http://localhost:${PORT}/landlord`);
    console.log(` Admin Portal:     http://localhost:${PORT}/admin`);
    console.log(`===============================================`);
  });
};

startServer();
