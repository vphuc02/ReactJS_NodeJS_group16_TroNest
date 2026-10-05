const mongoose = require('mongoose');
const { Schema } = mongoose;
const { USER_STATUS } = require('../configs/system.config');

const categorySchema = new Schema(
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
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'fa-solid fa-house-chimney'
    },
    status: {
      type: String,
      enum: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE],
      default: USER_STATUS.ACTIVE
    }
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model('Category', categorySchema, 'categories');

module.exports = Category;
