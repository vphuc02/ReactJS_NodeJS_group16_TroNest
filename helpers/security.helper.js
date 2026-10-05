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
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');
};

const getSafeRedirect = (value, fallback = '/') => {
  return isSafeLocalRedirect(value) ? value : fallback;
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
  return /^\/uploads\/rooms\/room-[a-zA-Z0-9-]+\.(jpe?g|png|webp|gif)$/i.test(value)
    || /^\/client\/assets\/images\/[a-zA-Z0-9._-]+\.(jpe?g|png|webp|gif)$/i.test(value);
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
