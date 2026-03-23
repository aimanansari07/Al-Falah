const { Schema, model } = require('mongoose');

// ── Prayer ──
const Prayer = model('Prayer', new Schema({
  key:     { type: String, required: true, unique: true },
  name:    String,
  arabic:  String,
  azan:    String,
  jamat:   String,
  qazaEnd: String,
  icon:    String,
}));

// ── Jumma (singleton) ──
const Jumma = model('Jumma', new Schema({
  azan1: String, jamat1: String,
  azan2: String, jamat2: String,
  note:  String,
}));

// ── Makruh ──
const Makruh = model('Makruh', new Schema({
  name: String, arabic: String,
  start: String, end: String, note: String,
}));

// ── Weekly ──
const Weekly = model('Weekly', new Schema({
  day: String, date: String, month: String,
  fajr: [String], dhuhr: [String], asr: [String],
  maghrib: [String], isha: [String],
}));

// ── Ramadan ──
const Ramadan = model('Ramadan', new Schema({
  day: Number, date: String,
  sehri: String, iftar: String, taraweeh: String,
}));

// ── Eid ──
const Eid = model('Eid', new Schema({
  type:   { type: String, enum: ['fitr', 'adha'], unique: true },
  name:   String, arabic: String, date: String,
  jamats: [String], venue: String, note: String,
  isLive: { type: Boolean, default: false },
}));

// ── Announcement ──
const Announcement = model('Announcement', new Schema({
  title:  { type: String, required: true },
  body:   { type: String, required: true },
  urgent: { type: Boolean, default: false },
  tag:    { type: String, default: 'Notice' },
  date:   String,
}, { timestamps: true }));

// ── Masjid (singleton) ──
const Masjid = model('Masjid', new Schema({
  name: String, arabic: String, address: String,
  phone: String, email: String, whatsapp: String,
  mapsUrl: String, about: String,
  ramadanMode: { type: Boolean, default: false },
}));

// ── Ticker (singleton) ──
const Ticker = model('Ticker', new Schema({
  items: [String],
}));

// ── LiveAzan (singleton) ──
const LiveAzan = model('LiveAzan', new Schema({
  isLive:       { type: Boolean, default: false },
  channelName:  { type: String,  default: 'alfahees-azan' },
  muazzinToken: { type: String,  default: null },
}));

// ── FCM Device Tokens ──
const FCMToken = model('FCMToken', new Schema({
  token:     { type: String, required: true, unique: true },
  updatedAt: { type: Date, default: Date.now },
}));

// ── Admin (singleton) ──
const Admin = model('Admin', new Schema({
  username:          { type: String, required: true },
  passwordHash:      { type: String, required: true },
  email:             String,
  otpHash:           String,
  otpExpires:        { type: Number, default: 0 },
  otpAttempts:       { type: Number, default: 0 },
  otpLockoutUntil:   { type: Number, default: 0 },
  loginAttempts:     { type: Number, default: 0 },
  loginLockoutUntil: { type: Number, default: 0 },
  isSetupComplete:   { type: Boolean, default: false },
  tokenVersion:      { type: Number, default: 1 },
}));

module.exports = { Prayer, Jumma, Makruh, Weekly, Ramadan, Eid, Announcement, Masjid, Ticker, LiveAzan, Admin, FCMToken };
