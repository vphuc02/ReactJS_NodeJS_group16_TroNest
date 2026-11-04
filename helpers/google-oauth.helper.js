const crypto = require('crypto');
const { JWT_SECRET, ROLES } = require('../configs/system.config');
const { getSafeRedirect } = require('./security.helper');

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_ENDPOINT = 'https://openidconnect.googleapis.com/v1/userinfo';

let mockGoogleProfileResolver = null;

const setMockGoogleProfileResolver = (resolver) => {
  mockGoogleProfileResolver = typeof resolver === 'function' ? resolver : null;
};

const hasMockGoogleProfileResolver = () => {
  return typeof mockGoogleProfileResolver === 'function';
};

const isPlaceholderValue = (val) => {
  if (!val) return true;
  const trimmed = String(val).trim();
  if (!trimmed) return true;
  return (
    trimmed.startsWith('<') ||
    trimmed.startsWith('your_') ||
    trimmed === 'GOOGLE_CLIENT_ID' ||
    trimmed === 'GOOGLE_CLIENT_SECRET'
  );
};

const hasGoogleOAuthConfig = () => {
  return (
    !isPlaceholderValue(process.env.GOOGLE_CLIENT_ID) &&
    !isPlaceholderValue(process.env.GOOGLE_CLIENT_SECRET)
  );
};

const getGoogleCallbackUrl = (req) => {
  if (process.env.GOOGLE_CALLBACK_URL && process.env.GOOGLE_CALLBACK_URL.trim()) {
    return process.env.GOOGLE_CALLBACK_URL.trim();
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.get('host') || `localhost:${process.env.PORT || 3000}`;
  return `${protocol}://${host}/auth/google/callback`;
};

const signStatePayload = (encodedPayload) => {
  return crypto
    .createHmac('sha256', JWT_SECRET)
    .update(encodedPayload)
    .digest('base64url');
};

const createOAuthState = ({ role, redirectUrl } = {}) => {
  const normalizedRole = role === ROLES.LANDLORD ? ROLES.LANDLORD : ROLES.CUSTOMER;
  const safeRedirect = getSafeRedirect(redirectUrl, '');
  const payload = {
    nonce: crypto.randomBytes(16).toString('hex'),
    role: normalizedRole,
    redirectUrl: safeRedirect,
    iat: Date.now()
  };

  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signStatePayload(encoded);
  return `${encoded}.${signature}`;
};

const parseOAuthState = (stateString) => {
  if (typeof stateString !== 'string' || !stateString.includes('.')) {
    return null;
  }

  const [encoded, signature] = stateString.split('.');
  if (!encoded || !signature) return null;

  const expectedSignature = signStatePayload(encoded);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    const role = parsed.role === ROLES.LANDLORD ? ROLES.LANDLORD : ROLES.CUSTOMER;
    const redirectUrl = getSafeRedirect(parsed.redirectUrl, '');
    return {
      nonce: parsed.nonce,
      role,
      redirectUrl
    };
  } catch {
    return null;
  }
};

const buildGoogleAuthUrl = ({ req, state }) => {
  const clientId = !isPlaceholderValue(process.env.GOOGLE_CLIENT_ID)
    ? process.env.GOOGLE_CLIENT_ID.trim()
    : 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  const url = new URL(GOOGLE_AUTH_ENDPOINT);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', getGoogleCallbackUrl(req));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('access_type', 'online');
  url.searchParams.set('prompt', 'select_account');
  url.searchParams.set('state', state);
  return url.toString();
};

const resolveGoogleProfile = async ({ code, req }) => {
  if (mockGoogleProfileResolver) {
    return await mockGoogleProfileResolver(code, req);
  }

  if (!hasGoogleOAuthConfig()) {
    throw new Error(
      'Chưa cấu hình GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong file .env!'
    );
  }

  const tokenRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID.trim(),
      client_secret: process.env.GOOGLE_CLIENT_SECRET.trim(),
      redirect_uri: getGoogleCallbackUrl(req),
      grant_type: 'authorization_code'
    }).toString()
  });

  if (!tokenRes.ok) {
    throw new Error('Không thể trao đổi mã xác thực với máy chủ Google OAuth!');
  }

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error('Máy chủ Google không trả về access_token hợp lệ!');
  }

  const profileRes = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: 'application/json'
    }
  });

  if (!profileRes.ok) {
    throw new Error('Không thể lấy thông tin hồ sơ người dùng từ Google!');
  }

  return await profileRes.json();
};

module.exports = {
  buildGoogleAuthUrl,
  createOAuthState,
  getGoogleCallbackUrl,
  hasGoogleOAuthConfig,
  hasMockGoogleProfileResolver,
  parseOAuthState,
  resolveGoogleProfile,
  setMockGoogleProfileResolver
};
