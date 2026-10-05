const wantsJson = (req) => {
  return Boolean(
    req.xhr ||
    req.headers.accept?.includes('json') ||
    req.headers['content-type']?.includes('json') ||
    (typeof req.is === 'function' && req.is('json'))
  );
};

const cookieOptions = (maxAge) => {
  const options = {
    httpOnly: true,
    sameSite: 'lax',
    maxAge
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  return options;
};

module.exports = {
  cookieOptions,
  wantsJson
};
