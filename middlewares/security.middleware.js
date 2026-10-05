const crypto = require('crypto');

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  next();
};

const csrfCookieOptions = () => ({
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production'
});

const csrfProtection = (req, res, next) => {
  let token = req.cookies[CSRF_COOKIE];
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE, token, csrfCookieOptions());
  }
  res.locals.csrfToken = token;

  if (!UNSAFE_METHODS.has(req.method)) {
    return next();
  }

  const submittedToken = req.get(CSRF_HEADER) || req.body?._csrf;
  if (submittedToken && submittedToken === token) {
    return next();
  }

  return res.status(403).json({
    code: 403,
    message: 'Phiên bảo mật không hợp lệ, vui lòng tải lại trang và thử lại.'
  });
};

const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 20,
  message = 'Bạn thao tác quá nhanh, vui lòng thử lại sau.'
} = {}) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = `${req.ip}:${req.originalUrl}`;
    const now = Date.now();
    const entry = attempts.get(key) || { count: 0, resetAt: now + windowMs };

    if (entry.resetAt <= now) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }

    entry.count += 1;
    attempts.set(key, entry);

    if (entry.count > max) {
      return res.status(429).json({ code: 429, message });
    }

    return next();
  };
};

module.exports = {
  createRateLimiter,
  csrfProtection,
  securityHeaders
};
