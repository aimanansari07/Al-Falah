import { PRAYERS as DEFAULT_PRAYERS, PRAYER_ORDER } from '../data/mockData';

// Convert "HH:MM" (24-hr) → "H:MM AM/PM"
export function fmt12(time) {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function toMins(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function nowMins() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export function getNextPrayer(mins, prayers = DEFAULT_PRAYERS) {
  const salah = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  for (const key of salah) {
    const pm = toMins(prayers[key].azan);
    if (mins < pm) {
      return { key, ...prayers[key], minsLeft: pm - mins };
    }
  }
  // After Isha — next is tomorrow's Fajr
  const fajrM = toMins(prayers.fajr.azan);
  return { key: 'fajr', ...prayers.fajr, minsLeft: 24 * 60 - mins + fajrM };
}

export function getActivePrayer(mins, prayers = DEFAULT_PRAYERS) {
  const salah = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  let active = 'isha';
  for (const key of salah) {
    if (mins >= toMins(prayers[key].azan)) active = key;
  }
  return active;
}

export function isMakruhNow(mins) {
  const ranges = [
    { name: 'Sunrise Period', start: toMins('06:52'), end: toMins('07:22') },
    { name: 'Zawal',          start: toMins('13:05'), end: toMins('13:15') },
    { name: 'Sunset Period',  start: toMins('19:22'), end: toMins('19:42') },
  ];
  return ranges.find(r => mins >= r.start && mins <= r.end) || null;
}

export function secsToDisplay(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) {
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

const HIJRI_MONTHS = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qi'dah", 'Dhul Hijjah',
];

// Pure JS Gregorian → Hijri conversion (no external dependency)
// -1 day offset applied to match moon-sighting based Hijri calendar (vs astronomical)
export function getHijri(date = new Date()) {
  const adjusted = new Date(date);
  adjusted.setDate(adjusted.getDate() - 1);
  const gy = adjusted.getFullYear();
  const gm = adjusted.getMonth() + 1;
  const gd = adjusted.getDate();

  // Gregorian → Julian Day Number
  const a = Math.floor((14 - gm) / 12);
  const y = gy + 4800 - a;
  const m = gm + 12 * a - 3;
  const jdn = gd
    + Math.floor((153 * m + 2) / 5)
    + 365 * y
    + Math.floor(y / 4)
    - Math.floor(y / 100)
    + Math.floor(y / 400)
    - 32045;

  // Julian Day Number → Hijri
  const k  = jdn - 1948440 + 10632;
  const n  = Math.floor((k - 1) / 10631);
  const k1 = k - 10631 * n + 354;
  const j  = Math.floor((10985 - k1) / 5316) * Math.floor((50 * k1) / 17719)
            + Math.floor(k1 / 5670)           * Math.floor((43 * k1) / 15238);
  const k2 = k1
    - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
    - Math.floor(j / 16)        * Math.floor((15238 * j) / 43)
    + 29;
  const hMonth = Math.floor((24 * k2) / 709);
  const hDay   = k2 - Math.floor((709 * hMonth) / 24);
  const hYear  = 30 * n + j - 30;

  return { day: hDay, month: HIJRI_MONTHS[hMonth - 1] ?? 'Ramadan', year: hYear };
}
