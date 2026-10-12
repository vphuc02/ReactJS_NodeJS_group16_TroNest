// routes/api/nearby.js
// API lấy phòng trọ gần vị trí người dùng
//
// Chiến lược tìm kiếm theo 2 tầng:
//   Tầng 1 (ưu tiên): $near bán kính GPS thực tế — chỉ phòng đã có tọa độ
//   Tầng 2 (fallback): text-match theo tỉnh — fallback cho phòng chưa được geocode
//
// "Nằm giữa 2 quận": $near trả về TẤT CẢ phòng trong bán kính bất kể quận,
// sắp xếp từ gần → xa. Phòng ở quận A (0.8km) sẽ đứng trước quận B (2.3km).

const express = require('express');
const router = express.Router();
const Room = require('../../models/room.model');
const { ROOM_STATUS } = require('../../configs/system.config');
const { escapeRegex } = require('../../helpers/security.helper');
const { VN_PROVINCES, stripUnitPrefix } = require('../../helpers/geo.helper');

// Bán kính tìm kiếm mặc định (mét)
const DEFAULT_RADIUS_M = 5000;  // 5km
const MAX_RADIUS_M     = 20000; // 20km (user có thể mở rộng)

// Tính khoảng cách Haversine (m) giữa 2 điểm
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Reverse geocode tọa độ → thông tin địa chỉ (province, suburb...) qua Nominatim
async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=vi&zoom=14`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'TroNest/1.0 (room-search-app)' }
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      state: data.address?.state || data.address?.city || null,
      city_district: data.address?.city_district || null,
      suburb: data.address?.suburb || data.address?.quarter || null,
      road: data.address?.road || null,
      displayName: data.display_name || null
    };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

// Khớp tên Nominatim → shortName VN tỉnh/thành phố
function matchProvince(nominatimState) {
  if (!nominatimState) return null;
  const needle = nominatimState
    .toLowerCase()
    .replace(/^(thành phố|tỉnh|tp\.?)\s*/i, '')
    .trim();
  return VN_PROVINCES.find((p) => {
    const hay = p.shortName.toLowerCase();
    return hay === needle || hay.includes(needle) || needle.includes(hay);
  }) || null;
}

/**
 * GET /api/geo/nearby?lat=...&lng=...&limit=6&radius=5000
 *
 * Trả về phòng trọ gần người dùng theo 2 tầng:
 *   - Tầng 1: $near (GPS bán kính), sắp xếp từ gần → xa, kèm distanceM
 *   - Tầng 2: fallback theo tỉnh nếu không đủ kết quả
 *
 * Response:
 *   { code, province, geo, radiusM, total, rooms: [{ ...room, distanceM }] }
 */
router.get('/nearby', async (req, res) => {
  const lat    = parseFloat(req.query.lat);
  const lng    = parseFloat(req.query.lng);
  const limit  = Math.min(parseInt(req.query.limit) || 6, 12);
  const radius = Math.min(
    parseInt(req.query.radius) || DEFAULT_RADIUS_M,
    MAX_RADIUS_M
  );

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ code: 400, message: 'Tọa độ không hợp lệ.' });
  }

  // Reverse geocode để lấy tên tỉnh (dùng cho fallback)
  const geo = await reverseGeocode(lat, lng);
  const matched = matchProvince(geo?.state);
  const provinceLabel = matched?.shortName || geo?.state || 'khu vực của bạn';

  // ─── TẦNG 1: $near — phòng đã có tọa độ GPS ──────────────────────────────
  // MongoDB $near tự động sắp xếp từ gần → xa.
  // Phòng ở bất kỳ quận nào trong bán kính đều xuất hiện.
  const nearbyRooms = await Room.find({
    status: ROOM_STATUS.APPROVED,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radius
      }
    }
  })
    .limit(limit)
    .populate('categoryId', 'title slug')
    .populate('landlordId', 'fullName phone')
    .lean();

  // Tính khoảng cách thực tế cho từng phòng
  const enrichedNearby = nearbyRooms.map((r) => {
    let distanceM = null;
    if (r.location?.coordinates?.length === 2) {
      const [roomLng, roomLat] = r.location.coordinates;
      distanceM = Math.round(haversineMeters(lat, lng, roomLat, roomLng));
    }
    return { ...r, distanceM };
  });

  // Nếu đủ kết quả từ Tầng 1, trả về luôn
  if (enrichedNearby.length >= Math.min(limit, 3)) {
    return res.json({
      code: 200,
      province: provinceLabel,
      geo: {
        lat, lng,
        suburb: geo?.suburb,
        city_district: geo?.city_district,
        road: geo?.road,
        displayName: geo?.displayName
      },
      radiusM: radius,
      source: 'gps',
      total: enrichedNearby.length,
      rooms: enrichedNearby
    });
  }

  // ─── TẦNG 2: Fallback — match theo tỉnh ──────────────────────────────────
  // Dùng cho phòng chưa được geocode, hoặc khu vực ít phòng trong bán kính.
  const fallbackRooms = await (async () => {
    if (!provinceLabel) return [];
    const safeProvince = escapeRegex(stripUnitPrefix(provinceLabel));
    const exclude = new Set(enrichedNearby.map((r) => r._id.toString()));

    return Room.find({
      status: ROOM_STATUS.APPROVED,
      province: { $regex: safeProvince, $options: 'i' },
      ...(exclude.size > 0 ? { _id: { $nin: [...exclude] } } : {})
    })
      .sort({ createdAt: -1 })
      .limit(limit - enrichedNearby.length)
      .populate('categoryId', 'title slug')
      .populate('landlordId', 'fullName phone')
      .lean();
  })();

  const fallbackEnriched = fallbackRooms.map((r) => ({ ...r, distanceM: null }));
  const allRooms = [...enrichedNearby, ...fallbackEnriched];

  return res.json({
    code: 200,
    province: provinceLabel,
    geo: {
      lat, lng,
      suburb: geo?.suburb,
      city_district: geo?.city_district,
      road: geo?.road,
      displayName: geo?.displayName
    },
    radiusM: radius,
    // 'mixed': kết hợp GPS + text; 'province': chỉ text fallback
    source: enrichedNearby.length > 0 ? 'mixed' : 'province',
    total: allRooms.length,
    rooms: allRooms
  });
});

module.exports = router;
