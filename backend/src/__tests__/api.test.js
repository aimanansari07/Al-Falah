'use strict';

process.env.JWT_SECRET    = 'test-jwt-secret';
process.env.ADMIN_USER    = 'admin';
process.env.ADMIN_PASS    = 'alfalah2025';
process.env.NODE_ENV      = 'test';

const mongoose            = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request             = require('supertest');

const app    = require('../app');
const seed   = require('../db/seed');
const { Admin } = require('../models');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await seed();
  // Mark setup as complete so it returns 403 and doesn't change the password
  await Admin.updateOne({}, { $set: { isSetupComplete: true } });
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

// ── Helper: get a valid auth token ───────────────────────────────────────────
async function login(user = 'admin', pass = 'alfalah2025') {
  const res = await request(app).post('/api/auth/login').send({ username: user, password: pass });
  return res.body.token;
}

// ── Health ────────────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.app).toBe('Al-Falah API');
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
describe('Unknown routes', () => {
  it('returns 404 for unknown paths', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
  });
});

// ── Auth ──────────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  it('returns token on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'alfalah2025' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 on unknown username', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'nobody', password: 'alfalah2025' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/setup', () => {
  it('returns 403 when setup is already complete', async () => {
    const res = await request(app).post('/api/auth/setup')
      .send({ email: 'test@masjid.com', newPassword: 'newpass123' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Setup already completed');
  });
});

// ── Prayers ───────────────────────────────────────────────────────────────────
describe('GET /api/prayers', () => {
  it('returns prayer times object', async () => {
    const res = await request(app).get('/api/prayers');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('fajr');
    expect(res.body).toHaveProperty('dhuhr');
    expect(res.body).toHaveProperty('asr');
    expect(res.body).toHaveProperty('maghrib');
    expect(res.body).toHaveProperty('isha');
  });

  it('prayer entries have required fields', async () => {
    const res = await request(app).get('/api/prayers');
    const fajr = res.body.fajr;
    expect(fajr).toHaveProperty('name');
    expect(fajr).toHaveProperty('azan');
    expect(fajr).toHaveProperty('icon');
  });

  it('fajr azan time has correct format (HH:MM)', async () => {
    const res = await request(app).get('/api/prayers');
    expect(res.body.fajr.azan).toMatch(/^\d{2}:\d{2}$/);
  });

  it('sunrise jamat is null', async () => {
    const res = await request(app).get('/api/prayers');
    expect(res.body.sunrise.jamat).toBeNull();
  });
});

describe('GET /api/prayers/jumma', () => {
  it('returns Jumma times', async () => {
    const res = await request(app).get('/api/prayers/jumma');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('azan1');
    expect(res.body).toHaveProperty('jamat1');
    expect(res.body).toHaveProperty('azan2');
    expect(res.body).toHaveProperty('jamat2');
  });
});

describe('PUT /api/prayers (protected)', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).put('/api/prayers').send({ fajr: { azan: '05:00' } });
    expect(res.status).toBe(401);
  });

  it('updates prayer times with valid token', async () => {
    const token = await login();
    const res = await request(app)
      .put('/api/prayers')
      .set('Authorization', `Bearer ${token}`)
      .send({ fajr: { azan: '05:20', jamat: '05:50' } });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify the change persisted
    const get = await request(app).get('/api/prayers');
    expect(get.body.fajr.azan).toBe('05:20');
    expect(get.body.fajr.jamat).toBe('05:50');
  });
});

// ── Masjid ────────────────────────────────────────────────────────────────────
describe('GET /api/masjid', () => {
  it('returns masjid info', async () => {
    const res = await request(app).get('/api/masjid');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('address');
  });
});

// ── Announcements ─────────────────────────────────────────────────────────────
describe('GET /api/announcements', () => {
  it('returns array of announcements', async () => {
    const res = await request(app).get('/api/announcements');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('each announcement has title and body', async () => {
    const res = await request(app).get('/api/announcements');
    res.body.forEach(a => {
      expect(a).toHaveProperty('title');
      expect(a).toHaveProperty('body');
    });
  });
});

describe('POST /api/announcements (protected)', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/announcements')
      .send({ title: 'Test', body: 'Body text' });
    expect(res.status).toBe(401);
  });

  it('creates announcement with valid token', async () => {
    const token = await login();
    const res = await request(app)
      .post('/api/announcements')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Announcement', body: 'This is a test.', tag: 'Notice' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Test Announcement');
  });
});

// ── Makruh ────────────────────────────────────────────────────────────────────
describe('GET /api/makruh', () => {
  it('returns makruh times array', async () => {
    const res = await request(app).get('/api/makruh');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
  });

  it('each makruh entry has start and end', async () => {
    const res = await request(app).get('/api/makruh');
    res.body.forEach(m => {
      expect(m).toHaveProperty('start');
      expect(m).toHaveProperty('end');
      expect(m.start).toMatch(/^\d{2}:\d{2}$/);
    });
  });
});

// ── Weekly ────────────────────────────────────────────────────────────────────
describe('GET /api/weekly', () => {
  it('returns 7 days of schedule', async () => {
    const res = await request(app).get('/api/weekly');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(7);
  });

  it('each day has fajr and isha arrays', async () => {
    const res = await request(app).get('/api/weekly');
    res.body.forEach(day => {
      expect(Array.isArray(day.fajr)).toBe(true);
      expect(Array.isArray(day.isha)).toBe(true);
    });
  });
});

// ── Eid ───────────────────────────────────────────────────────────────────────
describe('GET /api/eid', () => {
  it('returns eid info as object with fitr and adha keys', async () => {
    const res = await request(app).get('/api/eid');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('fitr');
    expect(res.body).toHaveProperty('adha');
    expect(res.body.fitr).toHaveProperty('jamats');
  });
});

// ── Ticker ────────────────────────────────────────────────────────────────────
describe('GET /api/ticker', () => {
  it('returns ticker items', async () => {
    const res = await request(app).get('/api/ticker');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
  });
});

// ── Live Azan ─────────────────────────────────────────────────────────────────
describe('GET /api/live-azan', () => {
  it('returns live azan status', async () => {
    const res = await request(app).get('/api/live-azan');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('isLive');
    expect(typeof res.body.isLive).toBe('boolean');
  });
});

describe('PUT /api/live-azan (protected)', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).put('/api/live-azan').send({ isLive: true });
    expect(res.status).toBe(401);
  });
});
