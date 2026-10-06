const path = require('path');

const IMAGE_MIME_EXTENSIONS = {
  'image/jpeg': {
    output: '.jpg',
    inputs: ['.jpg', '.jpeg']
  },
  'image/png': {
    output: '.png',
    inputs: ['.png']
  },
  'image/webp': {
    output: '.webp',
    inputs: ['.webp']
  },
  'image/gif': {
    output: '.gif',
    inputs: ['.gif']
  }
};

const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const isSafeLocalRedirect = (value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();

  // Must start with a single '/' and cannot start with '//' or contain any '\'
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return false;
  }

  // Prevent URL-encoded slashes or backslashes (e.g. /%5cexample.org or /%2fexample.org)
  try {
    const decoded = decodeURIComponent(trimmed);
    if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.includes('\\')) {
      return false;
    }
  } catch {
    return false;
  }

  // Verify against WHATWG URL parser with a dummy local origin
  try {
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost') {
      return false;
    }
    if (!parsed.pathname.startsWith('/') || parsed.pathname.startsWith('//')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const getSafeRedirect = (value, fallback = '/') => {
  return isSafeLocalRedirect(value) ? value.trim() : fallback;
};

const getImageExtension = (file) => {
  const originalExtension = path.extname(file.originalname).toLowerCase();
  const mimeConfig = IMAGE_MIME_EXTENSIONS[file.mimetype.toLowerCase()];

  if (!mimeConfig || !mimeConfig.inputs.includes(originalExtension)) {
    return null;
  }

  return mimeConfig.output;
};

const isSafeStoredImagePath = (value) => {
  if (typeof value !== 'string') return false;
  return (
    /^\/uploads\/rooms\/room-[a-zA-Z0-9-]+\.(jpe?g|png|webp|gif)$/i.test(value) ||
    /^\/client\/assets\/images\/[a-zA-Z0-9._-]+\.(jpe?g|png|webp|gif)$/i.test(value)
  );
};

const jsonForInlineScript = (value) => {
  return JSON.stringify(value).replace(/</g, '\\u003c');
};

module.exports = {
  IMAGE_MIME_EXTENSIONS,
  escapeRegex,
  getImageExtension,
  getSafeRedirect,
  isSafeLocalRedirect,
  isSafeStoredImagePath,
  jsonForInlineScript
};
