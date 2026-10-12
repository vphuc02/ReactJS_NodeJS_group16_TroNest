const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ROOM_DEFAULTS, ROOM_STATUS } = require('../configs/system.config');

const roomSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    price: {
      type: Number,
      required: true,
      default: 0
    },
    deposit: {
      type: Number,
      default: 0
    },
    area: {
      type: Number, // m2
      required: true,
      default: 0
    },
    capacity: {
      type: Number, // Số người ở tối đa
      default: 2
    },
    province: {
      type: String,
      default: ROOM_DEFAULTS.province
    },
    district: {
      type: String,
      default: ROOM_DEFAULTS.district
    },
    ward: {
      type: String,
      default: ROOM_DEFAULTS.ward
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    // Tọa độ GeoJSON (tuỳ chọn) — được tự động geocode từ address khi lưu.
    // Dùng cho tìm kiếm phòng gần vị trí ($near / $geoWithin).
    location: {
      type: new Schema(
        {
          type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
          },
          coordinates: {
            type: [Number] // [longitude, latitude] — theo chuẩn GeoJSON
          }
        },
        { _id: false }
      ),
      default: undefined
    },
    thumbnail: {
      type: String,
      default: ROOM_DEFAULTS.thumbnail
    },
    images: {
      type: [String],
      default: ROOM_DEFAULTS.images
    },
    description: {
      type: String,
      default: ''
    },
    amenities: {
      type: [String],
      default: []
    },
    electricityPrice: {
      type: String,
      default: ROOM_DEFAULTS.electricityPrice
    },
    waterPrice: {
      type: String,
      default: ROOM_DEFAULTS.waterPrice
    },
    servicePrice: {
      type: String,
      default: ROOM_DEFAULTS.servicePrice
    },
    status: {
      type: String,
      enum: Object.values(ROOM_STATUS),
      default: ROOM_STATUS.DRAFT
    },
    rejectReason: {
      type: String,
      default: ''
    },
    views: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Tự động bỏ location nếu không có đủ 2 tọa độ hợp lệ, tránh lỗi 2dsphere index trên MongoDB
roomSchema.pre('save', function () {
  if (
    this.location &&
    (!Array.isArray(this.location.coordinates) ||
      this.location.coordinates.length < 2 ||
      this.location.coordinates.some((coord) => typeof coord !== 'number' || isNaN(coord)))
  ) {
    this.location = undefined;
  }
});

// Tạo index hỗ trợ tìm kiếm nhanh
roomSchema.index({ title: 'text', address: 'text', district: 'text' });
roomSchema.index({ status: 1 });
roomSchema.index({ landlordId: 1 });
roomSchema.index({ categoryId: 1 });

// 2dsphere index — hỗ trợ $near, $geoWithin (chỉ áp dụng cho docs có location.coordinates)
roomSchema.index({ location: '2dsphere' }, { sparse: true });

const Room = mongoose.model('Room', roomSchema, 'rooms');

module.exports = Room;

