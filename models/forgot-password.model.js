const mongoose = require('mongoose');
const { Schema } = mongoose;

const forgotPasswordSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    otpHash: {
      type: String,
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    },
    resetTokenHash: {
      type: String,
      default: ''
    },
    expireAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    }
  },
  {
    timestamps: true
  }
);

const ForgotPassword = mongoose.model(
  'ForgotPassword',
  forgotPasswordSchema,
  'forgot_passwords'
);

module.exports = ForgotPassword;

