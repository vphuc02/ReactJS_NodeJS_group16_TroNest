process.env.NODE_ENV = 'test';
require('dotenv').config();

const { connectDB, disconnectDB } = require('../../configs/database.config');
const app = require('../../index');
const User = require('../../models/user.model');
const Room = require('../../models/room.model');
const Category = require('../../models/category.model');
const Favorite = require('../../models/favorite.model');

let server;
let baseUrl;

const startTestServer = async () => {
  await connectDB();
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  return { app, server, baseUrl };
};

const stopTestServer = async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
};

const clearTestData = async (prefix = 'test') => {
  await Promise.all([
    User.deleteMany({ email: { $regex: new RegExp(`@${prefix}\\.tronest\\.com$`, 'i') } }),
    Room.deleteMany({ title: { $regex: new RegExp(`^\\[${prefix.toUpperCase()}\\]`) } }),
    Category.deleteMany({ slug: { $regex: new RegExp(`^${prefix}-`) } }),
    Favorite.deleteMany({})
  ]);
};

module.exports = {
  startTestServer,
  stopTestServer,
  clearTestData,
  getBaseUrl: () => baseUrl
};
