const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');
const { JWT_SECRET, ROLES } = require('../../configs/system.config');

// [GET] /login
module.exports.loginGet = (req, res) => {
  if (req.user) {
    if (req.user.role === ROLES.LANDLORD) return res.redirect('/landlord/dashboard');
    return res.redirect('/');
  }
  res.render('client/pages/login', {
    title: 'Đăng nhập - TroNest',
    redirectUrl: req.query.redirect || ''
  });
};

// [POST] /login
module.exports.loginPost = async (req, res) => {
  try {
    const { email, password, rememberPassword } = req.body;

    if (!email || !password) {
      return res.json({
        code: 400,
        message: 'Vui lòng nhập đầy đủ Email và Mật khẩu!'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.json({
        code: 400,
        message: 'Tài khoản Email không tồn tại!'
      });
    }

    // Chặn tài khoản Quản trị viên đăng nhập tại form người dùng và không tiết lộ sự tồn tại của Admin
    if (user.role === ROLES.ADMIN) {
      return res.json({
        code: 400,
        message: 'Tài khoản hoặc mật khẩu không chính xác!'
      });
    }

    if (user.status === 'INACTIVE') {
      return res.json({
        code: 403,
        message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên!'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.json({
        code: 400,
        message: 'Mật khẩu không chính xác!'
      });
    }

    // Tạo JWT token (1 ngày hoặc 7 ngày nếu remember)
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
    res.cookie('token', token, {
      maxAge,
      httpOnly: true
    });

    let redirectUrl = user.role === ROLES.LANDLORD ? '/landlord/dashboard' : '/';

    let statusNote = '';
    if (user.role === ROLES.LANDLORD && user.status === 'PENDING') {
      statusNote = ' (Lưu ý: Tài khoản của bạn đang chờ Admin duyệt để có thể đăng phòng)';
    }

    return res.json({
      code: 200,
      message: `Đăng nhập thành công!${statusNote}`,
      redirectUrl: req.body.redirectUrl || redirectUrl
    });
  } catch (error) {
    console.error('Error in loginPost:', error);
    return res.json({
      code: 500,
      message: 'Đã xảy ra lỗi máy chủ, vui lòng thử lại sau!'
    });
  }
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
  try {
    const { fullName, email, password, phone, role, address } = req.body;

    if (!fullName || !email || !password) {
      return res.json({
        code: 400,
        message: 'Vui lòng điền đầy đủ các thông tin bắt buộc!'
      });
    }

    const existUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existUser) {
      return res.json({
        code: 400,
        message: 'Địa chỉ Email này đã được đăng ký trong hệ thống!'
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Xác định role và trạng thái ban đầu:
    // Nếu chọn LANDLORD -> status là PENDING (Chờ Admin duyệt)
    // Nếu là CUSTOMER -> status là ACTIVE ngay
    const userRole = role === ROLES.LANDLORD ? ROLES.LANDLORD : ROLES.CUSTOMER;
    const initialStatus = userRole === ROLES.LANDLORD ? 'PENDING' : 'ACTIVE';

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

    let successMessage = 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.';
    if (userRole === ROLES.LANDLORD) {
      successMessage =
        'Đăng ký tài khoản Chủ trọ thành công! Tài khoản đang ở trạng thái Chờ duyệt (PENDING). Admin sẽ kiểm tra và phê duyệt sớm nhất để bạn có thể đăng phòng.';
    }

    return res.json({
      code: 200,
      message: successMessage,
      role: userRole,
      status: initialStatus
    });
  } catch (error) {
    console.error('Error in registerPost:', error);
    return res.json({
      code: 500,
      message: 'Đăng ký thất bại, vui lòng thử lại!'
    });
  }
};

// [GET] /logout
module.exports.logoutGet = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
