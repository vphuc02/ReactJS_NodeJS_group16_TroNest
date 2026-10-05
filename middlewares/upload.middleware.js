const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../public/uploads/rooms');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'room-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype.toLowerCase();

  if (allowedTypes.test(ext) || mime.startsWith('image/')) {
    return cb(null, true);
  }
  cb(new Error('Chỉ chấp nhận các tệp hình ảnh hợp lệ (jpg, jpeg, png, webp, gif)!'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: fileFilter
});

// Middleware to handle multi-image uploads safely with JSON responses
module.exports.uploadRoomImages = (req, res, next) => {
  upload.array('images', 6)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          code: 400,
          message: 'Chỉ được tải lên tối đa 6 hình ảnh trong một lần!'
        });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          code: 400,
          message: 'Dung lượng mỗi ảnh không được vượt quá 10MB!'
        });
      }
      return res.status(400).json({
        code: 400,
        message: 'Lỗi tải ảnh: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        code: 400,
        message: err.message || 'Lỗi tải tệp ảnh lên máy chủ!'
      });
    }
    next();
  });
};
