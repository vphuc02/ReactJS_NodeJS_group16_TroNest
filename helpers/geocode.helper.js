// helpers/geocode.helper.js
// Geocode địa chỉ văn bản → tọa độ GPS [lng, lat] dùng Nominatim (OpenStreetMap, miễn phí).
// Được gọi tự động khi chủ trọ tạo hoặc sửa phòng để lưu location vào MongoDB.

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'TroNest/1.0 (room-listing-app)';

/**
 * Geocode một địa chỉ tiếng Việt → { lng, lat } hoặc null nếu thất bại.
 * Thêm ", Việt Nam" để tăng độ chính xác.
 * @param {string} address   - Địa chỉ đầy đủ của phòng trọ
 * @param {string} [province] - Tên tỉnh/thành (tuỳ chọn, giúp Nominatim thu hẹp kết quả)
 * @returns {Promise<{lng: number, lat: number} | null>}
 */
async function geocodeAddress(address, province = '') {
  if (!address || typeof address !== 'string') return null;

  // Ghép địa chỉ đầy đủ để Nominatim tra cứu chính xác hơn
  const query = [address.trim(), province.trim(), 'Việt Nam']
    .filter(Boolean)
    .join(', ');

  const url = new URL(NOMINATIM_BASE);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'vn');
  url.searchParams.set('accept-language', 'vi');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT }
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const results = await res.json();
    if (!results || results.length === 0) return null;

    const { lon, lat } = results[0];
    const lng = parseFloat(lon);
    const latitude = parseFloat(lat);

    if (isNaN(lng) || isNaN(latitude)) return null;
    return { lng, lat: latitude };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

module.exports = { geocodeAddress };
