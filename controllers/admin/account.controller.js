const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');
const { JWT_SECRET, ROLES, USER_STATUS } = require('../../configs/system.config');
const { cookieOptions } = require('../../helpers/http.helper');

// [GET] /admin/login
module.exports.loginGet = (req, res) => {
  const token = req.cookies.token_admin;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role === ROLES.ADMIN) {
        return res.redirect('/admin/dashboard');
      }
    } catch {
      res.clearCookie('token_admin');
    }
  }

  res.render('admin/pages/login', {
    title: 'Đăng nhập Quản trị viên - TroNest'
  });
};

// [POST] /admin/login
module.exports.loginPost = async (req, res) => {
  const { email, password, rememberPassword } = req.body;
  const invalidLogin = {
    code: 400,
    message: 'Tài khoản hoặc mật khẩu không chính xác!'
  };

  const user = await User.findOne({
    email: email.toLowerCase().trim()
  });

  if (!user || user.role !== ROLES.ADMIN) {
    return res.status(400).json(invalidLogin);
  }

  if (user.status === USER_STATUS.INACTIVE) {
    return res.status(403).json({
      code: 403,
      message: 'Tài khoản Quản trị viên đã bị khóa!'
    });
  }

  const isMatchedPassword = await bcrypt.compare(password, user.password);
  if (!isMatchedPassword) {
    return res.status(400).json(invalidLogin);
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
  res.cookie('token_admin', token, cookieOptions(maxAge));

  return res.json({
    code: 200,
    message: 'Đăng nhập Quản trị thành công!'
  });
};

// [POST] /admin/logout
module.exports.logoutPost = (req, res) => {
  res.clearCookie('token_admin');
  return res.json({
    code: 200,
    message: 'Đăng xuất thành công!',
    redirectUrl: '/admin/login'
  });
};

