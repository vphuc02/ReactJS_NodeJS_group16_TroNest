const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');
const { JWT_SECRET, ROLES, USER_STATUS } = require('../../configs/system.config');
const { cookieOptions } = require('../../helpers/http.helper');
const { getSafeRedirect } = require('../../helpers/security.helper');

// [GET] /login
module.exports.loginGet = (req, res) => {
  if (req.user) {
    if (req.user.role === ROLES.LANDLORD) return res.redirect('/landlord/dashboard');
    return res.redirect('/');
  }

  res.render('client/pages/login', {
    title: 'Đăng nhập - TroNest',
    redirectUrl: getSafeRedirect(req.query.redirect, '')
  });
};

// [POST] /login
module.exports.loginPost = async (req, res) => {
  const { email, password, rememberPassword } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      code: 400,
      message: 'Vui lòng nhập đầy đủ Email và Mật khẩu!'
    });
  }

  const invalidLogin = {
    code: 400,
    message: 'Tài khoản hoặc mật khẩu không chính xác!'
  };

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || user.role === ROLES.ADMIN) {
    return res.status(400).json(invalidLogin);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json(invalidLogin);
  }

  if (user.isBlocked || user.status === USER_STATUS.INACTIVE) {
    return res.status(403).json({
      code: 403,
      message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên!'
    });
  }

  const expiresIn = rememberPassword ? '7d' : '1d';
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn }
  );

  const maxAge = (rememberPassword ? 7 : 1) * 24 * 60 * 60 * 1000;
  res.cookie('token', token, cookieOptions(maxAge));

  const redirectUrl = user.role === ROLES.LANDLORD ? '/landlord/dashboard' : '/';
  const statusNote = user.role === ROLES.LANDLORD && user.status === USER_STATUS.PENDING
    ? ' (Lưu ý: Tài khoản của bạn đang chờ Admin duyệt để có thể đăng phòng)'
    : '';

  return res.json({
    code: 200,
    message: `Đăng nhập thành công!${statusNote}`,
    redirectUrl: getSafeRedirect(req.body.redirectUrl, redirectUrl)
  });
};

// [GET] /register
module.exports.registerGet = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }

  res.render('client/pages/register', {
    title: 'Đăng ký tài khoản - TroNest'
  });
};

// [POST] /register
module.exports.registerPost = async (req, res) => {
  const { fullName, email, password, phone, role, address } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      code: 400,
      message: 'Vui lòng điền đầy đủ các thông tin bắt buộc!'
    });
  }

  const existUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existUser) {
    return res.status(400).json({
      code: 400,
      message: 'Địa chỉ Email này đã được đăng ký trong hệ thống!'
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userRole = role === ROLES.LANDLORD ? ROLES.LANDLORD : ROLES.CUSTOMER;
  const initialStatus = userRole === ROLES.LANDLORD ? USER_STATUS.PENDING : USER_STATUS.ACTIVE;

  const newUser = new User({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    password: passwordHash,
    phone: phone ? phone.trim() : '',
    address: address ? address.trim() : '',
    role: userRole,
    status: initialStatus
  });

  await newUser.save();

  const successMessage = userRole === ROLES.LANDLORD
    ? 'Đăng ký tài khoản Chủ trọ thành công! Tài khoản đang ở trạng thái Chờ duyệt (PENDING). Admin sẽ kiểm tra và phê duyệt sớm nhất để bạn có thể đăng phòng.'
    : 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.';

  return res.json({
    code: 200,
    message: successMessage,
    role: userRole,
    status: initialStatus
  });
};

// [POST] /logout
module.exports.logoutPost = (req, res) => {
  res.clearCookie('token');
  return res.json({
    code: 200,
    message: 'Đăng xuất thành công!',
    redirectUrl: '/login'
  });
};

