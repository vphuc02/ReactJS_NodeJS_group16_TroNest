const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Cấu hình Cloudinary tương tự Project-1
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET
});

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_NAME &&
    process.env.CLOUDINARY_APIKEY &&
    process.env.CLOUDINARY_APISECRET
  );
};

// Storage engine mặc định cho Multer (tương thích trực tiếp với Project-1)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'tronest';
    if (file.fieldname === 'avatar') {
      folder = 'tronest/avatars';
    } else if (file.fieldname === 'images' || file.fieldname === 'thumbnail') {
      folder = 'tronest/rooms';
    }
    return {
      folder: folder,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
    };
  }
});

/**
 * Upload trực tiếp một Buffer lên Cloudinary thông qua upload_stream
 * @param {Buffer} buffer - Dữ liệu nhị phân của ảnh
 * @param {Object} options - Các tùy chọn upload của Cloudinary (folder, public_id, ...)
 * @returns {Promise<Object>} Kết quả upload trả về từ Cloudinary
 */
const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'tronest',
        resource_type: 'image',
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Xóa một ảnh trên Cloudinary theo public_id
 * @param {string} publicId - Mã định danh public_id của ảnh trên Cloudinary
 * @returns {Promise<Object|void>}
 */
const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    return await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (err) {
    console.error('Lỗi khi xóa ảnh trên Cloudinary:', err);
  }
};

module.exports = {
  cloudinary,
  storage,
  uploadBuffer,
  deleteImage,
  isCloudinaryConfigured
};
