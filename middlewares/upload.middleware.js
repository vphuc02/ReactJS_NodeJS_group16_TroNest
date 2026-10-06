const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');
const { randomUUID } = require('crypto');
const { getImageExtension } = require('../helpers/security.helper');
const { AppError } = require('../helpers/error.helper');

const uploadDir = path.join(__dirname, '../public/uploads/rooms');
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const USER_QUOTA_BYTES = 200 * 1024 * 1024;
const activeUploads = new Set();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 6, fields: 2, parts: 8 },
  fileFilter: (req, file, cb) => {
    if (getImageExtension(file)) return cb(null, true);
    cb(new AppError(400, 'Chỉ chấp nhận ảnh jpg, jpeg, png, webp, gif!'));
  }
}).array('images', 6);

const receiveImages = (req, res) => new Promise((resolve, reject) => {
  upload(req, res, (error) => error ? reject(error) : resolve());
});

module.exports.uploadRoomImages = async (req, res, next) => {
  const userId = String(req.user._id);
  if (activeUploads.size >= 4) {
    throw new AppError(503, 'Hệ thống tải ảnh đang bận. Vui lòng thử lại sau!');
  }
  if (activeUploads.has(userId)) {
    throw new AppError(429, 'Một lượt tải ảnh của bạn đang xử lý. Vui lòng đợi hoàn tất!');
  }
  activeUploads.add(userId);
  const writtenPaths = [];

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    // The owner prefix keeps quota accounting persistent across server restarts.
    const prefix = `room-${userId}-`;
    let usedBytes = 0;
    for (const file of await fs.readdir(uploadDir, { withFileTypes: true })) {
      if (file.isFile() && file.name.startsWith(prefix)) {
        const info = await fs.stat(path.join(uploadDir, file.name)).catch((error) => {
          if (error.code === 'ENOENT') return null;
          throw error;
        });
        usedBytes += info?.size || 0;
      }
    }
    if (usedBytes >= USER_QUOTA_BYTES) {
      throw new AppError(413, 'Dung lượng ảnh của tài khoản đã đạt giới hạn 200 MB!');
    }

    await receiveImages(req, res);
    const storedFiles = [];
    for (const file of req.files || []) {
      let buffer;
      try {
        const image = sharp(file.buffer, { limitInputPixels: 25000000, failOn: 'warning' });
        const metadata = await image.metadata();
        if (!['jpeg', 'png', 'webp', 'gif'].includes(metadata.format)) {
          throw new Error('Unsupported image content');
        }
        // Re-encoding strips metadata and stores a decoded, static image.
        buffer = await image.rotate().webp({ quality: 85 }).toBuffer();
      } catch {
        throw new AppError(400, 'Tệp ảnh bị hỏng, không đúng định dạng hoặc vượt quá 25 megapixel!');
      }
      if (buffer.length > MAX_FILE_BYTES || usedBytes + buffer.length > USER_QUOTA_BYTES) {
        throw new AppError(413, 'Ảnh vượt quá giới hạn dung lượng (10 MB/ảnh, 200 MB/tài khoản)!');
      }
      const filename = `${prefix}${randomUUID()}.webp`;
      const fullPath = path.join(uploadDir, filename);
      writtenPaths.push(fullPath);
      await fs.writeFile(fullPath, buffer, { flag: 'wx' });
      usedBytes += buffer.length;
      storedFiles.push({ filename, size: buffer.length, mimetype: 'image/webp' });
    }
    req.files = storedFiles;
    next();
  } catch (error) {
    await Promise.all(writtenPaths.map((filePath) => fs.unlink(filePath).catch(() => {})));
    if (error instanceof multer.MulterError) {
      return next(new AppError(400, error.code === 'LIMIT_FILE_SIZE'
        ? 'Dung lượng mỗi ảnh không được vượt quá 10 MB!'
        : 'Chỉ được tải tối đa 6 ảnh trong một lượt, không kèm trường dữ liệu thừa!'));
    }
    next(error);
  } finally {
    activeUploads.delete(userId);
  }
};
