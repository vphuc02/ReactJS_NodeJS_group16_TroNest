// routes/api/geo.js
// Vietnamese administrative units (post-2025 merger: 34 provinces, 2-level province -> ward).
// Data source: https://github.com/thanglequoc/vietnamese-provinces-database
//   json/vn_only_simplified_json_generated_data_vn_units_minified.json
const express = require('express');
const router = express.Router();

const units = require('../../data/vn-units/vn_units.json');
const metadata = require('../../data/vn-units/metadata.json');

const provinceIndex = new Map(units.map(p => [p.Code, p]));

// GET /api/geo/metadata -> dataset version info
router.get('/metadata', (req, res) => {
  res.json(metadata);
});

// GET /api/geo/provinces -> list of provinces (code + name)
router.get('/provinces', (req, res) => {
  res.json(units.map(p => ({
    code: p.Code,
    name: p.FullName,
    wardCount: p.Wards.length
  })));
});

// GET /api/geo/provinces/:code/wards -> wards of a province
router.get('/provinces/:code/wards', (req, res) => {
  const province = provinceIndex.get(req.params.code);
  if (!province) {
    return res.status(404).json({ message: 'Province not found' });
  }
  res.json(province.Wards.map(w => ({
    code: w.Code,
    name: w.FullName
  })));
});

module.exports = router;
