const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const cloudinaryHelper = require('../helpers/cloudinary.helper');
const { isCloudinaryImageUrl, isSafeStoredImagePath } = require('../helpers/security.helper');
const { extractCloudinaryPublicId } = require('../helpers/room.helper');
const uploadController = require('../controllers/admin/upload.controller');

describe('Kiểm thử tích hợp Cloudinary (Cloudinary Integration & Helper)', () => {
  test('Cloudinary Helper khởi tạo đúng và xuất đủ các phương thức', () => {
    assert.ok(cloudinaryHelper.cloudinary, 'Phải có instance cloudinary');
    assert.ok(cloudinaryHelper.storage, 'Phải có multer CloudinaryStorage instance');
    assert.equal(typeof cloudinaryHelper.uploadBuffer, 'function');
    assert.equal(typeof cloudinaryHelper.deleteImage, 'function');
    assert.equal(typeof cloudinaryHelper.isCloudinaryConfigured, 'function');
  });

  test('isCloudinaryConfigured nhận diện đúng cấu hình từ môi trường', () => {
    assert.equal(cloudinaryHelper.isCloudinaryConfigured(), true);
  });

  test('isCloudinaryImageUrl và isSafeStoredImagePath nhận diện chính xác URL từ Cloudinary', () => {
    const validCloudinaryUrls = [
      'https://res.cloudinary.com/bxg8l8qn/image/upload/v1712345678/tronest/rooms/room-abc-123.webp',
      'https://res.cloudinary.com/bxg8l8qn/image/upload/sample.jpg',
      'http://res.cloudinary.com/bxg8l8qn/image/upload/tronest/avatars/avatar-user-1.webp'
    ];

    for (const url of validCloudinaryUrls) {
      assert.equal(isCloudinaryImageUrl(url), true, `URL phải hợp lệ: ${url}`);
      assert.equal(isSafeStoredImagePath(url), true, `SafeStoredImage phải chấp nhận: ${url}`);
    }

    const invalidUrls = [
      'https://other-cloud.com/image/upload/sample.jpg',
      'javascript:alert(1)',
      '../../etc/passwd',
      'https://res.cloudinary.com/<script>alert(1)</script>'
    ];

    for (const url of invalidUrls) {
      assert.equal(isCloudinaryImageUrl(url), false, `URL giả mạo phải bị từ chối: ${url}`);
      assert.equal(isSafeStoredImagePath(url), false, `SafeStoredImage phải từ chối: ${url}`);
    }
  });

  test('extractCloudinaryPublicId trích xuất đúng publicId từ URL Cloudinary', () => {
    const url1 = 'https://res.cloudinary.com/bxg8l8qn/image/upload/v1712345678/tronest/rooms/room-123.webp';
    assert.equal(extractCloudinaryPublicId(url1), 'tronest/rooms/room-123');

    const url2 = 'https://res.cloudinary.com/bxg8l8qn/image/upload/sample.jpg';
    assert.equal(extractCloudinaryPublicId(url2), 'sample');

    const url3 = 'http://res.cloudinary.com/demo/image/upload/tronest/avatars/avatar-xyz.png';
    assert.equal(extractCloudinaryPublicId(url3), 'tronest/avatars/avatar-xyz');

    assert.equal(extractCloudinaryPublicId('/uploads/rooms/room-123.webp'), null);
    assert.equal(extractCloudinaryPublicId('https://other.com/photo.jpg'), null);
  });

  test('Upload controller trả về location và url khi có tệp', () => {
    let responseData = null;
    const req = {
      file: {
        path: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
      }
    };
    const res = {
      json: (data) => {
        responseData = data;
        return data;
      }
    };

    uploadController.imagePost(req, res);
    assert.equal(responseData.code, 200);
    assert.equal(responseData.location, 'https://res.cloudinary.com/demo/image/upload/sample.jpg');
    assert.equal(responseData.url, 'https://res.cloudinary.com/demo/image/upload/sample.jpg');
  });

  test('Upload controller trả về lỗi 400 khi không có tệp nào', () => {
    let statusCode = 200;
    let responseData = null;
    const req = {};
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        responseData = data;
        return data;
      }
    };

    uploadController.imagePost(req, res);
    assert.equal(statusCode, 400);
    assert.equal(responseData.code, 400);
  });
});

