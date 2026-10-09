// helpers/geo.helper.js
// Vietnamese administrative units after the 2025 merger (34 provinces, province -> ward).
const units = require('../data/vn-units/vn_units.json');

// "Thành phố Hà Nội" -> "Hà Nội", "Phường Ba Đình" -> "Ba Đình"
const stripUnitPrefix = (fullName = '') =>
  fullName.replace(/^(Thành phố|Tỉnh|Phường|Xã|Đặc khu)\s+/i, '').trim();

const VN_PROVINCES = units.map((p) => ({
  code: p.Code,
  name: p.FullName,
  shortName: stripUnitPrefix(p.FullName)
}));

const findProvinceByShortName = (shortName = '') => {
  const target = shortName.trim().toLowerCase();
  return VN_PROVINCES.find((p) => p.shortName.toLowerCase() === target) || null;
};

module.exports = {
  units,
  VN_PROVINCES,
  stripUnitPrefix,
  findProvinceByShortName
};
