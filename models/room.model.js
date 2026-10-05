const mongoose = require('mongoose');
const { Schema } = mongoose;

const roomSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
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
      default: 'Hà Nội'
    },
    district: {
      type: String,
      default: 'Cầu Giấy'
    },
    ward: {
      type: String,
      default: 'Dịch Vọng Hậu'
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    thumbnail: {
      type: String,
      default: '/client/assets/images/product-1.jpg'
    },
    images: {
      type: [String],
      default: ['/client/assets/images/product-1.jpg']
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
      default: '3.800 đ/kWh'
    },
    waterPrice: {
      type: String,
      default: '30.000 đ/m³'
    },
    servicePrice: {
      type: String,
      default: '100.000 đ/tháng'
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'DRAFT'
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

// Tạo index hỗ trợ tìm kiếm nhanh
roomSchema.index({ title: 'text', address: 'text', district: 'text' });

const Room = mongoose.model('Room', roomSchema, 'rooms');

module.exports = Room;
