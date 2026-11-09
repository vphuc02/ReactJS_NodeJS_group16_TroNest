const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');
const ForgotPassword = require('../../models/forgot-password.model');
const { JWT_SECRET, ROLES, USER_STATUS } = require('../../configs/system.config');
const { cookieOptions } = require('../../helpers/http.helper');
const { getSafeRedirect } = require('../../helpers/security.helper');
const { sendOtpEmail } = require('../../helpers/mail.helper');
const {
  buildGoogleAuthUrl,
  createOAuthState,
  parseOAuthState,
  resolveGoogleProfile
} = require('../../helpers/google-oauth.helper');

const hashToken = (raw) => {
  return crypto.createHash('sha256').update(String(raw)).digest('hex');
};

// [GET] /login
module.exports.loginGet = (req, res) => {
  if (req.user) {
    return res.json({
      code: 200,
      authenticated: true,
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role
      }
    });
  }

  return res.json({
    code: 200,
    authenticated: false,
    message: 'Trang đăng nhập TroNest'
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
    redirectUrl: getSafeRedirect(req.body.redirectUrl, redirectUrl),
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      status: user.status
    }
  });
};

// [GET] /register
module.exports.registerGet = (req, res) => {
  return res.json({
    code: 200,
    message: 'Trang đăng ký tài khoản TroNest'
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

// [GET] /auth/me (Lấy thông tin người dùng đang đăng nhập)
module.exports.meGet = (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      code: 401,
      message: 'Chưa đăng nhập!'
    });
  }
  return res.json({
    code: 200,
    user: req.user
  });
};

// [GET] /forgot-password
module.exports.forgotPasswordGet = (req, res) => {
  return res.json({
    code: 200,
    message: 'Khôi phục mật khẩu - TroNest'
  });
};

// [POST] /forgot-password (Bước 1: Nhập email & nhận mã OTP 6 số)
module.exports.forgotPasswordPost = async (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();

  if (!email) {
    return res.status(400).json({
      code: 400,
      message: 'Vui lòng nhập địa chỉ email!'
    });
  }

  const user = await User.findOne({ email });
  if (!user || user.role === ROLES.ADMIN) {
    return res.status(404).json({
      code: 404,
      message: 'Không tìm thấy tài khoản nào được đăng ký với địa chỉ Email này!'
    });
  }

  if (user.isBlocked || user.status === USER_STATUS.INACTIVE) {
    return res.status(403).json({
      code: 403,
      message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên!'
    });
  }

  // Tạo mã OTP 6 chữ số ngẫu nhiên (100000 -> 999999)
  const otp = String(crypto.randomInt(100000, 1000000));
  const expiresInMinutes = 5;
  const expireAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  await ForgotPassword.deleteMany({ email });
  await ForgotPassword.create({
    email,
    otpHash: hashToken(otp),
    attempts: 0,
    verified: false,
    resetTokenHash: '',
    expireAt
  });

  const mailResult = await sendOtpEmail({
    to: email,
    fullName: user.fullName,
    otp,
    expiresInMinutes
  });

  const responsePayload = {
    code: 200,
    message: mailResult.delivered
      ? `Mã xác thực OTP đã được gửi tới email ${email}. Vui lòng kiểm tra hộp thư!`
      : `Đã tạo mã xác thực OTP cho ${email} (hiệu lực ${expiresInMinutes} phút).`,
    email,
    expiresIn: expiresInMinutes * 60,
    deliveryMode: mailResult.mode
  };

  if (mailResult.devOtp && process.env.NODE_ENV === 'test') {
    responsePayload.devOtp = mailResult.devOtp;
  }

  return res.json(responsePayload);
};

// [POST] /forgot-password/verify-otp (Bước 2: Xác thực mã OTP 6 số)
module.exports.verifyOtpPost = async (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();
  const otp = String(req.body.otp || '').trim();

  const record = await ForgotPassword.findOne({ email }).sort({ createdAt: -1 });
  if (!record || record.expireAt <= new Date()) {
    await ForgotPassword.deleteMany({ email });
    return res.status(400).json({
      code: 400,
      message: 'Mã xác thực OTP đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu gửi lại mã mới!'
    });
  }

  if (record.attempts >= 5) {
    await ForgotPassword.deleteMany({ email });
    return res.status(400).json({
      code: 400,
      message: 'Bạn đã nhập sai mã OTP quá 5 lần. Vui lòng yêu cầu gửi lại mã mới!'
    });
  }

  const inputOtpHash = hashToken(otp);
  if (inputOtpHash !== record.otpHash) {
    record.attempts += 1;
    await record.save();
    const remaining = Math.max(0, 5 - record.attempts);

    if (remaining === 0) {
      await ForgotPassword.deleteMany({ email });
      return res.status(400).json({
        code: 400,
        message: 'Bạn đã nhập sai mã OTP quá 5 lần. Mã đã bị hủy, vui lòng gửi lại mã mới!'
      });
    }

    return res.status(400).json({
      code: 400,
      message: `Mã xác thực OTP không chính xác! (Còn ${remaining} lần thử)`
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  record.verified = true;
  record.resetTokenHash = hashToken(resetToken);
  record.expireAt = new Date(Date.now() + 10 * 60 * 1000);
  await record.save();

  res.cookie('reset_token', resetToken, cookieOptions(10 * 60 * 1000));

  return res.json({
    code: 200,
    message: 'Xác thực OTP thành công! Vui lòng thiết lập mật khẩu mới.',
    email,
    resetToken
  });
};

// [POST] /forgot-password/reset-password (Bước 3: Đặt lại mật khẩu mới)
module.exports.resetPasswordPost = async (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();
  const password = req.body.password;
  const rawResetToken = req.body.resetToken || req.cookies?.reset_token || '';

  if (!rawResetToken) {
    return res.status(400).json({
      code: 400,
      message: 'Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thực hiện lại!'
    });
  }

  const record = await ForgotPassword.findOne({ email, verified: true }).sort({ createdAt: -1 });
  if (!record || record.expireAt <= new Date() || !record.resetTokenHash) {
    await ForgotPassword.deleteMany({ email });
    res.clearCookie('reset_token');
    return res.status(400).json({
      code: 400,
      message: 'Phiên đặt lại mật khẩu đã hết hạn. Vui lòng thực hiện lại từ đầu!'
    });
  }

  if (hashToken(rawResetToken) !== record.resetTokenHash) {
    return res.status(400).json({
      code: 400,
      message: 'Mã phiên khôi phục mật khẩu không hợp lệ!'
    });
  }

  const user = await User.findOne({ email });
  if (!user || user.role === ROLES.ADMIN) {
    await ForgotPassword.deleteMany({ email });
    res.clearCookie('reset_token');
    return res.status(404).json({
      code: 404,
      message: 'Tài khoản không tồn tại!'
    });
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  await ForgotPassword.deleteMany({ email });
  res.clearCookie('reset_token');

  return res.json({
    code: 200,
    message: 'Đặt lại mật khẩu mới thành công! Vui lòng đăng nhập lại.',
    redirectUrl: '/login'
  });
};

// [GET] /reset-password (Mở link đặt lại mật khẩu từ email)
module.exports.resetPasswordPageGet = async (req, res) => {
  const token = String(req.query.token || '').trim();
  const email = String(req.query.email || '').toLowerCase().trim();

  if (!token || !email) {
    return res.status(400).json({
      code: 400,
      valid: false,
      message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu thông tin!'
    });
  }

  const record = await ForgotPassword.findOne({ email, verified: true }).sort({ createdAt: -1 });
  if (!record || record.expireAt <= new Date() || !record.resetTokenHash) {
    return res.status(400).json({
      code: 400,
      valid: false,
      message: 'Liên kết đặt lại mật khẩu đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu link mới!'
    });
  }

  if (hashToken(token) !== record.resetTokenHash) {
    return res.status(400).json({
      code: 400,
      valid: false,
      message: 'Mã token trong liên kết không chính xác hoặc đã bị vô hiệu hóa!'
    });
  }

  return res.json({
    code: 200,
    valid: true,
    message: 'Đặt lại mật khẩu - TroNest',
    token,
    email
  });
};

// [POST] /reset-password (Xác nhận đổi mật khẩu mới từ link email)
module.exports.resetPasswordFromLinkPost = async (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();
  const token = String(req.body.token || '').trim();
  const { password, confirmPassword } = req.body;

  if (!email || !token) {
    return res.status(400).json({
      code: 400,
      message: 'Thiếu thông tin xác thực phiên đặt lại mật khẩu!'
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      code: 400,
      message: 'Mật khẩu mới phải có ít nhất 6 ký tự!'
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      code: 400,
      message: 'Mật khẩu xác nhận không khớp với mật khẩu mới!'
    });
  }

  const record = await ForgotPassword.findOne({ email, verified: true }).sort({ createdAt: -1 });
  if (!record || record.expireAt <= new Date() || !record.resetTokenHash) {
    await ForgotPassword.deleteMany({ email });
    return res.status(400).json({
      code: 400,
      message: 'Liên kết đổi mật khẩu đã hết hạn. Vui lòng gửi lại yêu cầu mới!'
    });
  }

  if (hashToken(token) !== record.resetTokenHash) {
    return res.status(400).json({
      code: 400,
      message: 'Token xác thực không hợp lệ!'
    });
  }

  const user = await User.findOne({ email });
  if (!user || user.role === ROLES.ADMIN) {
    await ForgotPassword.deleteMany({ email });
    return res.status(404).json({
      code: 404,
      message: 'Tài khoản không tồn tại!'
    });
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  await ForgotPassword.deleteMany({ email });

  return res.json({
    code: 200,
    message: 'Đặt lại mật khẩu mới thành công! Vui lòng đăng nhập lại.',
    redirectUrl: '/login'
  });
};

const resolveFrontendOriginFromReq = (req) => {
  const referer = req.get('referer') || req.get('origin') || '';
  if (!referer) return '';
  try {
    const parsed = new URL(referer);
    const currentHostOrigin = `${req.protocol}://${req.get('host')}`;
    if (parsed.origin === currentHostOrigin) return '';
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(parsed.origin)) {
      return parsed.origin;
    }
    const allowed = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    if (allowed.includes(parsed.origin)) {
      return parsed.origin;
    }
  } catch {
    // ignore
  }
  return '';
};

// [GET] /auth/google
module.exports.googleAuthGet = (req, res) => {
  const frontendOrigin = resolveFrontendOriginFromReq(req);
  if (req.user) {
    if (req.user.role === ROLES.LANDLORD) {
      return res.redirect(`${frontendOrigin}/landlord/dashboard`);
    }
    return res.redirect(`${frontendOrigin}/`);
  }

  const role = req.query.role === ROLES.LANDLORD ? ROLES.LANDLORD : ROLES.CUSTOMER;
  const redirectUrl = getSafeRedirect(req.query.redirect, '');
  const state = createOAuthState({ role, redirectUrl, frontendOrigin });

  res.cookie('google_oauth_state', state, cookieOptions(10 * 60 * 1000));

  const authUrl = buildGoogleAuthUrl({ req, state });
  return res.redirect(authUrl);
};

// [GET] /auth/google/callback
module.exports.googleAuthCallbackGet = async (req, res) => {
  const queryState = String(req.query.state || '');
  const parsedStateForOrigin = parseOAuthState(queryState);
  const frontendOrigin = parsedStateForOrigin?.frontendOrigin || '';

  const redirectWithError = (msg) => {
    res.clearCookie('google_oauth_state');
    return res.redirect(`${frontendOrigin}/login?error=${encodeURIComponent(msg)}`);
  };

  if (req.query.error) {
    return redirectWithError('Bạn đã hủy hoặc từ chối đăng nhập bằng tài khoản Google!');
  }

  const cookieState = req.cookies?.google_oauth_state || '';
  res.clearCookie('google_oauth_state');

  if (!cookieState || !queryState || cookieState !== queryState) {
    return redirectWithError(
      'Phiên xác thực Google không hợp lệ hoặc đã hết hạn (CSRF state mismatch). Vui lòng thử lại!'
    );
  }

  const statePayload = parsedStateForOrigin;
  if (!statePayload) {
    return redirectWithError('Trạng thái xác thực Google không hợp lệ. Vui lòng thử lại!');
  }

  const code = String(req.query.code || '').trim();
  if (!code) {
    return redirectWithError('Không nhận được mã xác thực từ Google. Vui lòng thử lại!');
  }

  try {
    const profile = await resolveGoogleProfile({ code, req });
    const email = String(profile?.email || '').toLowerCase().trim();
    const googleId = String(profile?.sub || profile?.id || '').trim();
    const fullName = String(
      profile?.name || (email ? email.split('@')[0] : '') || 'Người dùng Google'
    ).trim();
    const picture = String(profile?.picture || '').trim();
    const emailVerified = profile?.email_verified !== false;

    if (!email || !googleId || !emailVerified) {
      return redirectWithError(
        'Tài khoản Google chưa xác thực địa chỉ email hoặc thiếu thông tin định danh!'
      );
    }

    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    });

    if (user) {
      if (user.role === ROLES.ADMIN) {
        return redirectWithError(
          'Tài khoản Quản trị viên không được phép đăng nhập tại cổng Khách hàng!'
        );
      }

      if (user.isBlocked || user.status === USER_STATUS.INACTIVE) {
        return redirectWithError('Tài khoản của bạn đã bị khóa bởi Quản trị viên!');
      }

      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (
        picture &&
        (!user.avatar || user.avatar === '/admin/assets/images/avatar.jpg')
      ) {
        user.avatar = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      const targetRole =
        statePayload.role === ROLES.LANDLORD ? ROLES.LANDLORD : ROLES.CUSTOMER;
      const initialStatus =
        targetRole === ROLES.LANDLORD ? USER_STATUS.PENDING : USER_STATUS.ACTIVE;
      const randomPasswordHash = await bcrypt.hash(
        crypto.randomBytes(32).toString('hex'),
        10
      );

      user = await User.create({
        fullName,
        email,
        password: randomPasswordHash,
        phone: '',
        address: '',
        avatar: picture || '/admin/assets/images/avatar.jpg',
        role: targetRole,
        status: initialStatus,
        authProvider: 'google',
        googleId
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, cookieOptions(7 * 24 * 60 * 60 * 1000));

    const defaultRedirect =
      user.role === ROLES.LANDLORD ? '/landlord/dashboard' : '/';
    const finalRedirect = getSafeRedirect(statePayload.redirectUrl, defaultRedirect);
    return res.redirect(`${frontendOrigin}${finalRedirect}`);
  } catch (err) {
    return redirectWithError(
      err?.message || 'Đăng nhập bằng Google thất bại. Vui lòng thử lại!'
    );
  }
};


