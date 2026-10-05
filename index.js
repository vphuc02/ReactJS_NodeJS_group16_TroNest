require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { connectDB } = require('./configs/database.config');
const { PORT } = require('./configs/system.config');
const { attachUser } = require('./middlewares/auth.middleware');

const clientRouter = require('./routers/client/index.route');
const landlordRouter = require('./routers/landlord/index.route');
const adminRouter = require('./routers/admin/index.route');

const app = express();

// Connect to MongoDB
connectDB();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

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

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).render('client/pages/error', {
    title: '404 - Không tìm thấy trang',
    message: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển hướng!'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` TroNest Server is running at http://localhost:${PORT}`);
  console.log(` Client Portal:    http://localhost:${PORT}`);
  console.log(` Landlord Portal:  http://localhost:${PORT}/landlord`);
  console.log(` Admin Portal:     http://localhost:${PORT}/admin`);
  console.log(`===============================================`);
});
