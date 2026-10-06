require('dotenv').config();
const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const Room = require('../models/room.model');
const { isSafeStoredImagePath } = require('../helpers/security.helper');

const run = async () => {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--apply')) throw new Error('Usage: yarn uploads:cleanup [--apply]');
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  const apply = args.includes('--apply');
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const uploadDir = path.resolve(__dirname, '../public/uploads/rooms');
  await mongoose.connect(process.env.MONGODB_URI);
  const entries = await fs.readdir(uploadDir, { withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  let count = 0;
  for (const entry of entries) {
    const imagePath = `/uploads/rooms/${entry.name}`;
    if (!entry.isFile() || !isSafeStoredImagePath(imagePath)) continue;
    const filePath = path.join(uploadDir, entry.name);
    const info = await fs.lstat(filePath);
    if (!info.isFile() || info.mtimeMs > cutoff) continue;
    if (await Room.exists({ $or: [{ thumbnail: imagePath }, { images: imagePath }] })) continue;
    console.log(`${apply ? 'REMOVE' : 'WOULD REMOVE'} ${entry.name}`);
    if (apply) await fs.unlink(filePath);
    count += 1;
  }
  console.log(`${apply ? 'Removed' : 'Dry run candidates:'} ${count} unreferenced files older than 24 hours.`);
};

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
