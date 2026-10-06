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

  const cleanupExpired = (now = Date.now()) => {
    for (const [key, entry] of attempts.entries()) {
      if (entry.resetAt <= now) {
        attempts.delete(key);
      }
    }
  };

  const timer = setInterval(
    () => {
      cleanupExpired();
    },
    Math.min(windowMs, 60000)
  );

  if (timer.unref) {
    timer.unref();
  }

  return (req, res, next) => {
    const rawUrl = req.originalUrl || req.url || '';
    const pathOnly = rawUrl.split('?')[0] || req.path || '/';
    const normalizedPath = pathOnly.toLowerCase().replace(/\/+$/, '') || '/';
    const clientIp = req.ip || req.socket?.remoteAddress || 'unknown';
    const key = `${clientIp}:${normalizedPath}`;
    const now = Date.now();

    if (attempts.size > 1000) {
      cleanupExpired(now);
    }

    let entry = attempts.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: now + windowMs };
      attempts.set(key, entry);
    } else {
      entry.count += 1;
    }

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
