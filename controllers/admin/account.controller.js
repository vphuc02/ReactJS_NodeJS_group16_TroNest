const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');
const { JWT_SECRET, ROLES } = require('../../configs/system.config');

// [GET] /admin/account/login (hoặc /admin/login)
module.exports.loginGet = (req, res) => {
  try {
    const token = req.cookies.token_admin || req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === ROLES.ADMIN) {
          return res.redirect('/admin/dashboard');
        }
      } catch (e) {
        res.clearCookie('token_admin');
      }
    }
    res.render('admin/pages/login', {
      title: 'Đăng nhập Quản trị viên - TroNest'
    });
  } catch (error) {
    console.error('Error in admin loginGet:', error);
    res.redirect('/');
  }
};

// [POST] /admin/account/login
module.exports.loginPost = async (req, res) => {
  try {
    const { email, password, rememberPassword } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.json({
        code: 'error',
        message: 'Tài khoản Quản trị viên không tồn tại!'
      });
    }

    // Chặn nếu là tài khoản người dùng hoặc chủ trọ (không có quyền ADMIN)
    if (user.role !== ROLES.ADMIN) {
      return res.json({
        code: 'error',
        message: 'Tài khoản của bạn không có quyền Quản trị viên!'
      });
    }

    if (user.status === 'INACTIVE') {
      return res.json({
        code: 'error',
        message: 'Tài khoản Quản trị viên đã bị khóa!'
      });
    }

    const isMatchedPassword = bcrypt.compareSync(password, user.password);
    if (!isMatchedPassword) {
      return res.json({
        code: 'error',
        message: 'Mật khẩu không chính xác!'
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
    res.cookie('token_admin', token, { maxAge, httpOnly: true });
    res.cookie('token', token, { maxAge, httpOnly: true });

    return res.json({
      code: 200,
      message: 'Đăng nhập Quản trị thành công!'
    });
  } catch (error) {
    console.error('Error in admin account loginPost:', error);
    return res.json({
      code: 'error',
      message: 'Đăng nhập thất bại, vui lòng thử lại sau!'
    });
  }
};

// [GET] /admin/account/logout (hoặc /admin/logout)
module.exports.logoutGet = (req, res) => {
  try {
    res.clearCookie('token_admin');
    res.clearCookie('token');
    res.redirect('/admin/login');
  } catch (error) {
    console.error('Error in admin logoutGet:', error);
    res.redirect('/admin/login');
  }
};
