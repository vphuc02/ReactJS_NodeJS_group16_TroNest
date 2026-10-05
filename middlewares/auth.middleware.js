const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { JWT_SECRET, ROLES } = require('../configs/system.config');

// Middleware gắn thông tin user vào req và res.locals (dùng toàn cục)
module.exports.attachUser = async (req, res, next) => {
  try {
    // Nếu request thuộc /admin thì ưu tiên đọc cookie token_admin
    const token = req.originalUrl.startsWith('/admin')
      ? (req.cookies.token_admin || req.cookies.token)
      : req.cookies.token;

    if (!token) {
      req.user = null;
      res.locals.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.status === 'INACTIVE') {
      res.clearCookie('token');
      res.clearCookie('token_admin');
      req.user = null;
      res.locals.user = null;
      return next();
    }

    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    req.user = null;
    res.locals.user = null;
    next();
  }
};

// Middleware yêu cầu quyền Quản trị viên riêng biệt (Chỉ dành cho Admin)
module.exports.requireAdminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token_admin || req.cookies.token;
    if (!token) {
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(401).json({
          code: 401,
          message: 'Vui lòng đăng nhập Quản trị viên!'
        });
      }
      return res.redirect('/admin/login');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const adminUser = await User.findById(decoded.id).select('-password');

    if (!adminUser || adminUser.role !== ROLES.ADMIN || adminUser.status === 'INACTIVE') {
      res.clearCookie('token_admin');
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(403).json({
          code: 403,
          message: 'Tài khoản không có quyền truy cập Quản trị viên!'
        });
      }
      return res.redirect('/admin/login');
    }

    req.user = adminUser;
    res.locals.user = adminUser;
    req.admin = adminUser;
    res.locals.admin = adminUser;
    next();
  } catch (error) {
    res.clearCookie('token_admin');
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(401).json({
        code: 401,
        message: 'Phiên làm việc hết hạn, vui lòng đăng nhập lại!'
      });
    }
    return res.redirect('/admin/login');
  }
};

// Middleware yêu cầu đăng nhập chung cho Khách thuê & Chủ trọ
module.exports.requireAuth = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(401).json({
          code: 401,
          message: 'Vui lòng đăng nhập để thực hiện chức năng này!'
        });
      }
      return res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(403).json({
          code: 403,
          message: 'Bạn không có quyền truy cập vào tài nguyên này!'
        });
      }
      return res.status(403).render('client/pages/error', {
        title: 'Truy cập bị từ chối',
        message: 'Bạn không có quyền truy cập vào trang này!'
      });
    }

    next();
  };
};

// Middleware kiểm tra Chủ trọ đã được Admin duyệt chưa
module.exports.requireApprovedLandlord = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.LANDLORD) {
    return res.status(403).render('client/pages/error', {
      title: 'Quyền truy cập',
      message: 'Chỉ tài khoản Chủ trọ mới có quyền thực hiện thao tác này!'
    });
  }

  if (req.user.status !== 'APPROVED') {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(403).json({
        code: 403,
        message:
          req.user.status === 'PENDING'
            ? 'Tài khoản Chủ trọ của bạn đang trong trạng thái Chờ duyệt. Vui lòng đợi Admin phê duyệt trước khi đăng bài!'
            : 'Tài khoản Chủ trọ của bạn đã bị từ chối phê duyệt!'
      });
    }

    return res.render('landlord/pages/pending-approval', {
      title: 'Tài khoản chưa được duyệt',
      status: req.user.status,
      rejectReason: req.user.rejectReason
    });
  }

  next();
};
