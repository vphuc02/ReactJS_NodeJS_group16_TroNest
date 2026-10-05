const mongoose = require('mongoose');
const { Schema } = mongoose;

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
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model('Category', categorySchema, 'categories');

module.exports = Category;
