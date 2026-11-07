const fs = require('fs/promises');
const path = require('path');
const Room = require('../models/room.model');
const { isSafeStoredImagePath, isCloudinaryImageUrl } = require('./security.helper');
const { deleteImage } = require('./cloudinary.helper');

const extractCloudinaryPublicId = (url) => {
  if (typeof url !== 'string' || !isCloudinaryImageUrl(url)) return null;
  const match = url.match(/\/image\/upload\/(?:v\d+\/)?([^\s"'<>\\]+?)(?:\.[a-zA-Z0-9]+)?$/);
  return match ? match[1] : null;
};

const removeUnreferencedImages = async (imagePaths) => {
  const candidates = [...new Set(imagePaths || [])].filter(
    (value) =>
      typeof value === 'string' &&
      isSafeStoredImagePath(value) &&
      (value.startsWith('/uploads/rooms/') || isCloudinaryImageUrl(value))
  );

  for (const imagePath of candidates) {
    const stillUsed = await Room.exists({
      $or: [{ thumbnail: imagePath }, { images: imagePath }]
    });

    if (!stillUsed) {
      if (imagePath.startsWith('/uploads/rooms/')) {
        const fullPath = path.join(__dirname, '../public', imagePath);
        await fs.unlink(fullPath).catch(() => {});
      } else if (isCloudinaryImageUrl(imagePath)) {
        const publicId = extractCloudinaryPublicId(imagePath);
        if (publicId) {
          await deleteImage(publicId).catch(() => {});
        }
      }
    }
  }
};

module.exports = {
  extractCloudinaryPublicId,
  removeUnreferencedImages
};
