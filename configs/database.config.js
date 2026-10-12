const mongoose = require('mongoose');
require('dotenv').config();

module.exports.connectDB = async (customUri) => {
  try {
    let mongoUri = customUri || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Biến môi trường MONGODB_URI chưa được cấu hình trong file .env');
    }
    if (process.env.NODE_ENV === 'test' && !customUri) {
      mongoUri = mongoUri.replace(/\/tronest(\?|$)/, '/tronest_test$1');
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    if (process.env.NODE_ENV !== 'test') {
      console.log('Connected to TroNest MongoDB successfully');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports.disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
