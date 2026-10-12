// scripts/geocode-rooms.js
// Migration script: Cập nhật tọa độ GPS (GeoJSON Point) cho các phòng trọ hiện có trong database.
// Tra cứu Nominatim trước; nếu timeout/không tìm thấy thì dùng tọa độ trung tâm quận/huyện tương ứng.

require('dotenv').config();
const { connectDB } = require('../configs/database.config');
const Room = require('../models/room.model');
const { geocodeAddress } = require('../helpers/geocode.helper');

// Bảng tọa độ trung tâm các quận/huyện phổ biến để fallback nhanh và chính xác
const DISTRICT_COORDS = {
  'cầu giấy': [105.7892, 21.0326],
  'đống đa': [105.8285, 21.0181],
  'ba đình': [105.8251, 21.0341],
  'hai bà trưng': [105.8504, 21.0084],
  'hoàn kiếm': [105.8542, 21.0285],
  'thanh xuân': [105.8078, 20.9938],
  'hoàng mai': [105.8488, 20.9765],
  'long biên': [105.8858, 21.0384],
  'nam từ liêm': [105.7656, 21.0183],
  'bắc từ liêm': [105.7601, 21.0664],
  'tây hồ': [105.8194, 21.0638],
  'hà đông': [105.7758, 20.9723],

  // TP.HCM
  'quận 1': [106.6994, 10.7769],
  'quận 3': [106.6842, 10.7831],
  'quận 5': [106.6666, 10.7554],
  'quận 7': [106.7218, 10.7340],
  'quận 10': [106.6669, 10.7715],
  'bình thạnh': [106.7023, 10.8038],
  'thủ đức': [106.7648, 10.8494],
  'gò vấp': [106.6644, 10.8387],
  'tân bình': [106.6573, 10.7992]
};

function getFallbackCoords(district, province) {
  if (!district) return [105.8342, 21.0278]; // Mặc định trung tâm Hà Nội
  const key = district.toLowerCase().replace(/^(quận|huyện|thị xã|thành phố)\s+/i, '').trim();
  for (const [dName, coords] of Object.entries(DISTRICT_COORDS)) {
    if (dName.includes(key) || key.includes(dName)) {
      // Thêm jitter nhẹ (~100-300m) để các phòng trong cùng quận không bị trùng khít 1 điểm
      const jitterLng = (Math.random() - 0.5) * 0.005;
      const jitterLat = (Math.random() - 0.5) * 0.005;
      return [coords[0] + jitterLng, coords[1] + jitterLat];
    }
  }
  return province && province.toLowerCase().includes('hồ chí minh')
    ? [106.6297, 10.8231]
    : [105.8342, 21.0278];
}

async function run() {
  await connectDB();
  console.log('Connected to MongoDB. Starting geocoding migration...');

  const rooms = await Room.find({
    $or: [
      { location: { $exists: false } },
      { 'location.coordinates': { $exists: false } },
      { 'location.coordinates': { $size: 0 } }
    ]
  });

  console.log(`Found ${rooms.length} rooms without GPS coordinates.`);

  let successCount = 0;
  for (const room of rooms) {
    const fullAddress = [room.address, room.district, room.province].filter(Boolean).join(', ');
    console.log(`Geocoding room [${room._id}]: ${fullAddress}`);

    let coords = null;
    try {
      coords = await geocodeAddress(fullAddress, room.province);
    } catch {
      coords = null;
    }

    let finalCoords;
    if (coords && coords.lng && coords.lat) {
      finalCoords = [coords.lng, coords.lat];
      console.log(`  -> Nominatim found: [${finalCoords.join(', ')}]`);
    } else {
      finalCoords = getFallbackCoords(room.district, room.province);
      console.log(`  -> Fallback coords: [${finalCoords.join(', ')}]`);
    }

    room.location = {
      type: 'Point',
      coordinates: finalCoords
    };
    await room.save();
    successCount++;

    // Sleep 500ms giữa các request để tuân thủ Nominatim rate-limit
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\nHoàn thành! Đã cập nhật tọa độ cho ${successCount}/${rooms.length} phòng.`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Lỗi migration:', err);
  process.exit(1);
});
