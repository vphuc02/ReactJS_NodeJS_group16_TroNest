const mongoose = require('mongoose');
require('dotenv').config();

module.exports.connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Biến môi trường MONGODB_URI chưa được cấu hình trong file .env');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to TroNest MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};
