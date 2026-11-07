const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { JWT_SECRET, ROLES, USER_STATUS } = require('../configs/system.config');

const extractToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return req.originalUrl?.startsWith('/admin')
    ? req.cookies?.token_admin || req.cookies?.token
    : req.cookies?.token;
};

// Middleware gắn thông tin user vào req và res.locals (dùng toàn cục)
module.exports.attachUser = async (req, res, next) => {
  res.locals.currentPath = req.originalUrl ? req.originalUrl.split('?')[0] : req.path;
  try {
    const token = extractToken(req);

    if (!token) {
      req.user = null;
      res.locals.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.isBlocked || user.status === USER_STATUS.INACTIVE) {
      res.clearCookie('token');
      res.clearCookie('token_admin');
      req.user = null;
      res.locals.user = null;
      return next();
    }

    req.user = user;
    res.locals.user = user;
    next();
  } catch {
    req.user = null;
    res.locals.user = null;
    next();
  }
};

// Middleware yêu cầu quyền Quản trị viên riêng biệt (Chỉ dành cho Admin)
module.exports.requireAdminAuth = (req, res, next) => {
  const token = extractToken(req) || req.cookies?.token_admin;
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: 'Vui lòng đăng nhập Quản trị viên!'
    });
  }

  const adminUser = req.user;
  if (!adminUser) {
    res.clearCookie('token_admin');
    return res.status(401).json({
      code: 401,
      message: 'Phiên làm việc hết hạn, vui lòng đăng nhập lại!'
    });
  }

  if (adminUser.role !== ROLES.ADMIN || adminUser.isBlocked || adminUser.status === USER_STATUS.INACTIVE) {
    res.clearCookie('token_admin');
    return res.status(403).json({
      code: 403,
      message: 'Tài khoản không có quyền truy cập Quản trị viên!'
    });
  }

  req.admin = adminUser;
  res.locals.admin = adminUser;
  next();
};

// Middleware yêu cầu đăng nhập chung cho Khách thuê & Chủ trọ
module.exports.requireAuth = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      if (req.headers.accept?.includes('application/json') || req.is('json') || req.xhr) {
        return res.status(401).json({
          code: 401,
          message: 'Vui lòng đăng nhập để thực hiện chức năng này!'
        });
      }
      return res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        code: 403,
        message: 'Bạn không có quyền truy cập vào tài nguyên này!'
      });
    }

    next();
  };
};

// Middleware kiểm tra Chủ trọ đã được Admin duyệt chưa
module.exports.requireApprovedLandlord = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.LANDLORD) {
    return res.status(403).json({
      code: 403,
      message: 'Chỉ tài khoản Chủ trọ mới có quyền thực hiện thao tác này!'
    });
  }

  if (req.user.status !== USER_STATUS.APPROVED) {
    return res.status(403).json({
      code: 403,
      message:
        req.user.status === USER_STATUS.PENDING
          ? 'Tài khoản Chủ trọ của bạn đang trong trạng thái Chờ duyệt. Vui lòng đợi Admin phê duyệt trước khi đăng bài!'
          : 'Tài khoản Chủ trọ của bạn đã bị từ chối phê duyệt!'
    });
  }

  next();
};
