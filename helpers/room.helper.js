const fs = require('fs/promises');
const path = require('path');
const Room = require('../models/room.model');
const { isSafeStoredImagePath } = require('./security.helper');

const removeUnreferencedImages = async (imagePaths) => {
  const candidates = [...new Set(imagePaths || [])].filter(
    (value) =>
      typeof value === 'string' &&
      value.startsWith('/uploads/rooms/') &&
      isSafeStoredImagePath(value)
  );

  for (const imagePath of candidates) {
    const stillUsed = await Room.exists({
      $or: [{ thumbnail: imagePath }, { images: imagePath }]
    });

    if (!stillUsed) {
      const fullPath = path.join(__dirname, '../public', imagePath);
      await fs.unlink(fullPath).catch(() => {});
    }
  }
};

module.exports = {
  removeUnreferencedImages
};
