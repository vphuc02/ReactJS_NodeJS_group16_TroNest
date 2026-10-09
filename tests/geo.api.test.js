// tests/geo.api.test.js
// Run: npm test   (or: node --test tests/)
// Spins up the /api/geo router on a random port and checks provinces + wards data.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

const geoRouter = require('../routes/api/geo');

let server;
let baseUrl;

const get = async (path) => {
  const res = await globalThis.fetch(baseUrl + path);
  return { status: res.status, body: await res.json() };
};

before(async () => {
  const app = express();
  app.use('/api/geo', geoRouter);
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

describe('GET /api/geo/metadata', () => {
  test('returns dataset version and decree', async () => {
    const { status, body } = await get('/api/geo/metadata');
    assert.equal(status, 200);
    assert.ok(body.DatasetVersion, 'missing DatasetVersion');
    assert.ok(body.LatestDecree, 'missing LatestDecree');
  });
});

describe('GET /api/geo/provinces', () => {
  let provinces;

  before(async () => {
    const { status, body } = await get('/api/geo/provinces');
    assert.equal(status, 200);
    provinces = body;
  });

  test('has exactly 34 provinces/cities (post-2025 merger)', () => {
    assert.equal(provinces.length, 34);
  });

  test('every province has a 2-digit code, a name and at least 1 ward', () => {
    for (const p of provinces) {
      assert.match(p.code, /^\d{2}$/, `bad code: ${p.code}`);
      assert.match(p.name, /^(Tỉnh|Thành phố) /, `bad name: ${p.name}`);
      assert.ok(p.wardCount > 0, `${p.name} has no wards`);
    }
  });

  test('province codes are unique', () => {
    const codes = provinces.map((p) => p.code);
    assert.equal(new Set(codes).size, codes.length);
  });

  test('contains all 6 centrally-run cities', () => {
    const names = provinces.map((p) => p.name);
    for (const city of ['Hà Nội', 'Hồ Chí Minh', 'Hải Phòng', 'Đà Nẵng', 'Cần Thơ', 'Huế']) {
      assert.ok(names.includes(`Thành phố ${city}`), `missing Thành phố ${city}`);
    }
  });

  test('merged-away provinces no longer exist', () => {
    const names = provinces.map((p) => p.name);
    for (const old of ['Tỉnh Bình Dương', 'Tỉnh Hà Giang', 'Tỉnh Quảng Nam', 'Tỉnh Bạc Liêu']) {
      assert.ok(!names.includes(old), `${old} should have been merged`);
    }
  });

  test('total wards across the country is 3321', () => {
    const total = provinces.reduce((sum, p) => sum + p.wardCount, 0);
    assert.equal(total, 3321);
  });
});

describe('GET /api/geo/provinces/:code/wards', () => {
  test('Hà Nội (01) has 126 wards incl. Phường Ba Đình and Phường Hoàn Kiếm', async () => {
    const { status, body } = await get('/api/geo/provinces/01/wards');
    assert.equal(status, 200);
    assert.equal(body.length, 126);
    const names = body.map((w) => w.name);
    assert.ok(names.includes('Phường Ba Đình'));
    assert.ok(names.includes('Phường Hoàn Kiếm'));
  });

  test('TP.HCM (79) has 168 wards incl. former Bình Dương ward Phường Thủ Dầu Một', async () => {
    const { status, body } = await get('/api/geo/provinces/79/wards');
    assert.equal(status, 200);
    assert.equal(body.length, 168);
    assert.ok(body.some((w) => w.name === 'Phường Thủ Dầu Một'));
  });

  test('ward count for each province matches /provinces wardCount', async () => {
    const { body: provinces } = await get('/api/geo/provinces');
    for (const p of provinces) {
      const { status, body } = await get(`/api/geo/provinces/${p.code}/wards`);
      assert.equal(status, 200, `${p.name} returned ${status}`);
      assert.equal(body.length, p.wardCount, `${p.name} ward count mismatch`);
    }
  });

  test('every ward has a 5-digit code and a valid type prefix; codes are unique nationwide', async () => {
    const { body: provinces } = await get('/api/geo/provinces');
    const seen = new Set();
    for (const p of provinces) {
      const { body: wards } = await get(`/api/geo/provinces/${p.code}/wards`);
      for (const w of wards) {
        assert.match(w.code, /^\d{5}$/, `bad ward code in ${p.name}: ${w.code}`);
        // case-insensitive: upstream data has "xã Bắc Sơn" (Lạng Sơn) in lowercase
        assert.match(w.name, /^(Phường|Xã|Đặc khu) /i, `bad ward name in ${p.name}: ${w.name}`);
        assert.ok(!seen.has(w.code), `duplicate ward code ${w.code}`);
        seen.add(w.code);
      }
    }
    assert.equal(seen.size, 3321);
  });

  test('unknown province code returns 404', async () => {
    const { status, body } = await get('/api/geo/provinces/99/wards');
    assert.equal(status, 404);
    assert.equal(body.message, 'Province not found');
  });
});
