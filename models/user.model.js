const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    avatar: {
      type: String,
      default: '/admin/assets/images/avatar.jpg'
    },
    address: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['ADMIN', 'LANDLORD', 'CUSTOMER'],
      default: 'CUSTOMER'
    },
    // LANDLORD: PENDING -> APPROVED | REJECTED
    // CUSTOMER: ACTIVE | INACTIVE
    // ADMIN: ACTIVE
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    },
    rejectReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
