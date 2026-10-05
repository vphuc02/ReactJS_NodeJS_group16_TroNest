const mongoose = require('mongoose');
const { Schema } = mongoose;

const favoriteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Một user chỉ yêu thích 1 phòng 1 lần
favoriteSchema.index({ userId: 1, roomId: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema, 'favorites');

module.exports = Favorite;
