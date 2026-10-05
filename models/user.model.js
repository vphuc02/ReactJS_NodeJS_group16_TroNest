const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ROLES, USER_STATUS } = require('../configs/system.config');

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
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER
    },
    // LANDLORD: PENDING -> APPROVED | REJECTED
    // CUSTOMER: ACTIVE | INACTIVE
    // ADMIN: ACTIVE
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE
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
