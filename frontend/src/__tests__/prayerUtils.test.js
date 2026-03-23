import { describe, it, expect } from 'vitest';
import { fmt12, toMins, nowMins, getNextPrayer, getActivePrayer, secsToDisplay, getHijri } from '../utils/prayerUtils';

// ── Mock prayers object (same structure as DB) ──────────────────────────────
const PRAYERS = {
  fajr:    { name: 'Fajr',    arabic: 'فجر', azan: '05:18', jamat: '05:45', icon: '🌙' },
  sunrise: { name: 'Sunrise', arabic: 'شروق', azan: '06:52', jamat: null,   icon: '🌅' },
  dhuhr:   { name: 'Dhuhr',   arabic: 'ظہر', azan: '13:10', jamat: '13:30', icon: '☀️' },
  asr:     { name: 'Asr',     arabic: 'عصر', azan: '16:25', jamat: '17:00', icon: '🌤' },
  maghrib: { name: 'Maghrib', arabic: 'مغرب', azan: '19:42', jamat: '19:47', icon: '🌆' },
  isha:    { name: 'Isha',    arabic: 'عشاء', azan: '21:15', jamat: '21:45', icon: '🌃' },
};

// ── fmt12 ────────────────────────────────────────────────────────────────────
describe('fmt12 — 24hr to 12hr conversion', () => {
  it('converts midnight correctly',    () => expect(fmt12('00:00')).toBe('12:00 AM'));
  it('converts noon correctly',        () => expect(fmt12('12:00')).toBe('12:00 PM'));
  it('converts Fajr 05:18',           () => expect(fmt12('05:18')).toBe('5:18 AM'));
  it('converts Dhuhr 13:10',          () => expect(fmt12('13:10')).toBe('1:10 PM'));
  it('converts Maghrib 19:42',        () => expect(fmt12('19:42')).toBe('7:42 PM'));
  it('converts Isha 21:45',           () => expect(fmt12('21:45')).toBe('9:45 PM'));
  it('pads minutes correctly (9:05)', () => expect(fmt12('09:05')).toBe('9:05 AM'));
  it('returns null for null input',   () => expect(fmt12(null)).toBe(null));
  it('handles 23:59',                 () => expect(fmt12('23:59')).toBe('11:59 PM'));
  it('handles 01:00',                 () => expect(fmt12('01:00')).toBe('1:00 AM'));
});

// ── toMins ───────────────────────────────────────────────────────────────────
describe('toMins — time string to minutes', () => {
  it('converts 00:00 → 0',    () => expect(toMins('00:00')).toBe(0));
  it('converts 01:00 → 60',   () => expect(toMins('01:00')).toBe(60));
  it('converts 05:18 → 318',  () => expect(toMins('05:18')).toBe(318));
  it('converts 13:30 → 810',  () => expect(toMins('13:30')).toBe(810));
  it('converts 23:59 → 1439', () => expect(toMins('23:59')).toBe(1439));
  it('converts 12:00 → 720',  () => expect(toMins('12:00')).toBe(720));
});

// ── getNextPrayer ────────────────────────────────────────────────────────────
describe('getNextPrayer — finds correct upcoming prayer', () => {
  it('before Fajr (03:00) → next is Fajr', () => {
    const result = getNextPrayer(180, PRAYERS);
    expect(result.key).toBe('fajr');
    expect(result.minsLeft).toBe(138); // 318 - 180
  });

  it('between Fajr and Dhuhr (09:00) → next is Dhuhr', () => {
    const result = getNextPrayer(540, PRAYERS);
    expect(result.key).toBe('dhuhr');
    expect(result.minsLeft).toBe(250); // 790 - 540
  });

  it('between Dhuhr and Asr (15:00) → next is Asr', () => {
    const result = getNextPrayer(900, PRAYERS);
    expect(result.key).toBe('asr');
    expect(result.minsLeft).toBe(85); // 985 - 900
  });

  it('between Asr and Maghrib (18:00) → next is Maghrib', () => {
    const result = getNextPrayer(1080, PRAYERS);
    expect(result.key).toBe('maghrib');
    expect(result.minsLeft).toBe(102); // 1182 - 1080
  });

  it('between Maghrib and Isha (20:00) → next is Isha', () => {
    const result = getNextPrayer(1200, PRAYERS);
    expect(result.key).toBe('isha');
    expect(result.minsLeft).toBe(75); // 1275 - 1200
  });

  it('after Isha (23:00) → wraps to tomorrow Fajr', () => {
    const result = getNextPrayer(1380, PRAYERS);
    expect(result.key).toBe('fajr');
    expect(result.minsLeft).toBeGreaterThan(0);
  });

  it('result always has minsLeft > 0', () => {
    [0, 200, 400, 600, 800, 1000, 1200, 1400].forEach(m => {
      expect(getNextPrayer(m, PRAYERS).minsLeft).toBeGreaterThan(0);
    });
  });
});

// ── getActivePrayer ──────────────────────────────────────────────────────────
describe('getActivePrayer — identifies current prayer period', () => {
  it('before Fajr (03:00) → isha (from yesterday)', () => {
    expect(getActivePrayer(180, PRAYERS)).toBe('isha');
  });

  it('after Fajr azan (05:30) → fajr',     () => expect(getActivePrayer(330, PRAYERS)).toBe('fajr'));
  it('after Dhuhr azan (13:20) → dhuhr',   () => expect(getActivePrayer(800, PRAYERS)).toBe('dhuhr'));
  it('after Asr azan (16:30) → asr',       () => expect(getActivePrayer(990, PRAYERS)).toBe('asr'));
  it('after Maghrib azan (19:50) → maghrib', () => expect(getActivePrayer(1190, PRAYERS)).toBe('maghrib'));
  it('after Isha azan (21:20) → isha',     () => expect(getActivePrayer(1280, PRAYERS)).toBe('isha'));
});

// ── secsToDisplay ────────────────────────────────────────────────────────────
describe('secsToDisplay — countdown format', () => {
  it('formats seconds only',          () => expect(secsToDisplay(45)).toBe('00:45'));
  it('formats minutes and seconds',   () => expect(secsToDisplay(125)).toBe('02:05'));
  it('formats hours correctly',       () => expect(secsToDisplay(3661)).toBe('01:01:01'));
  it('formats zero',                  () => expect(secsToDisplay(0)).toBe('00:00'));
  it('formats 1hr exactly',          () => expect(secsToDisplay(3600)).toBe('01:00:00'));
  it('formats 59:59',                 () => expect(secsToDisplay(3599)).toBe('59:59'));
});

// ── getHijri ─────────────────────────────────────────────────────────────────
describe('getHijri — Gregorian to Hijri conversion', () => {
  it('returns an object with day, month, year', () => {
    const h = getHijri(new Date('2026-03-22'));
    expect(h).toHaveProperty('day');
    expect(h).toHaveProperty('month');
    expect(h).toHaveProperty('year');
  });

  it('day is between 1 and 30', () => {
    const h = getHijri(new Date('2026-03-22'));
    expect(h.day).toBeGreaterThanOrEqual(1);
    expect(h.day).toBeLessThanOrEqual(30);
  });

  it('year is in valid Hijri range (1440s)', () => {
    const h = getHijri(new Date('2026-03-22'));
    expect(h.year).toBeGreaterThan(1440);
    expect(h.year).toBeLessThan(1460);
  });

  it('month is a valid Hijri month name', () => {
    const MONTHS = ['Muharram','Safar',"Rabi' al-Awwal","Rabi' al-Thani",
      'Jumada al-Ula','Jumada al-Akhirah','Rajab',"Sha'ban",
      'Ramadan','Shawwal',"Dhul Qi'dah",'Dhul Hijjah'];
    const h = getHijri(new Date('2026-03-22'));
    expect(MONTHS).toContain(h.month);
  });

  it('Mar 22 2026 falls in Shawwal 1447', () => {
    const h = getHijri(new Date('2026-03-22'));
    expect(h.year).toBe(1447);
    expect(h.month).toBe('Shawwal');
  });

  it('uses today when no date passed', () => {
    const h = getHijri();
    expect(h.day).toBeGreaterThanOrEqual(1);
    expect(typeof h.month).toBe('string');
  });
});
