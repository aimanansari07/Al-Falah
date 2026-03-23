const bcrypt = require('bcryptjs');
const {
  Prayer, Jumma, Makruh, Weekly, Ramadan,
  Eid, Masjid, Ticker, LiveAzan, Admin,
} = require('../models');

function computeRamadan() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = i + 1;
    const sM = Math.max(0, 58 - Math.round(i * 0.5));
    const iM = 15 + Math.round(i * 0.7);
    const iH = iM >= 60 ? 19 : 18;
    const iF = iM >= 60 ? iM - 60 : iM;
    const dn = d <= 14 ? d + 1 : d - 14;
    const mon = d <= 14 ? 'Mar' : 'Apr';
    return {
      day: d, date: `${dn} ${mon}`,
      sehri: `04:${String(sM).padStart(2, '0')}`,
      iftar: `${iH}:${String(iF).padStart(2, '0')}`,
      taraweeh: '21:45'
    };
  });
}
module.exports = async function seed() {
  // Only seed if DB is empty
  const adminCount = await Admin.countDocuments();
  if (adminCount > 0) return;

  console.log('🌱 Seeding database...');

  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'alfalah2025';

  await Promise.all([
    // Admin
    Admin.create({
      username: adminUser,
      passwordHash: bcrypt.hashSync(adminPass, 10),
    }),

    // Prayers
    Prayer.insertMany([
      { key: 'fajr', name: 'Fajr', arabic: 'فجر', azan: '05:18', jamat: '05:45', qazaEnd: '07:30', icon: '🌙' },
      { key: 'sunrise', name: 'Sunrise', arabic: 'شروق', azan: '06:52', jamat: null, qazaEnd: null, icon: '🌅' },
      { key: 'dhuhr', name: 'Dhuhr', arabic: 'ظہر', azan: '13:10', jamat: '13:30', qazaEnd: '14:45', icon: '☀️' },
      { key: 'asr', name: 'Asr', arabic: 'عصر', azan: '16:25', jamat: '17:00', qazaEnd: '18:30', icon: '🌤' },
      { key: 'maghrib', name: 'Maghrib', arabic: 'مغرب', azan: '19:42', jamat: '19:47', qazaEnd: '21:00', icon: '🌆' },
      { key: 'isha', name: 'Isha', arabic: 'عشاء', azan: '21:15', jamat: '21:45', qazaEnd: '23:59', icon: '🌃' },
      { key: 'tahajjud', name: 'Tahajjud', arabic: 'تہجد', azan: '03:30', jamat: null, qazaEnd: null, icon: '⭐' },
    ]),

    // Jumma
    Jumma.create({
      azan1: '12:30', jamat1: '13:00', azan2: '13:30', jamat2: '14:00',
      note: 'Please arrive early. Gates open from 12:00.'
    }),

    // Makruh
    Makruh.insertMany([
      { name: 'Sunrise (Ishraq)', arabic: 'وقت الشروق', start: '06:52', end: '07:22', note: '20 min after sunrise' },
      { name: 'Zawal (Midday)', arabic: 'وقت الزوال', start: '13:05', end: '13:15', note: 'Sun at zenith' },
      { name: 'Sunset (Gharub)', arabic: 'وقت الغروب', start: '19:22', end: '19:42', note: '20 min before Maghrib' },
    ]),

    // Weekly
    Weekly.insertMany([
      { day: 'Mon', date: '10', month: 'Mar', fajr: ['05:20', '05:45'], dhuhr: ['13:10', '13:30'], asr: ['16:25', '17:00'], maghrib: ['19:40', '19:45'], isha: ['21:15', '21:45'] },
      { day: 'Tue', date: '11', month: 'Mar', fajr: ['05:18', '05:45'], dhuhr: ['13:10', '13:30'], asr: ['16:26', '17:00'], maghrib: ['19:42', '19:47'], isha: ['21:15', '21:45'] },
      { day: 'Wed', date: '12', month: 'Mar', fajr: ['05:16', '05:43'], dhuhr: ['13:10', '13:30'], asr: ['16:27', '17:00'], maghrib: ['19:44', '19:49'], isha: ['21:15', '21:45'] },
      { day: 'Thu', date: '13', month: 'Mar', fajr: ['05:14', '05:43'], dhuhr: ['13:09', '13:30'], asr: ['16:28', '17:00'], maghrib: ['19:46', '19:51'], isha: ['21:15', '21:45'] },
      { day: 'Fri', date: '14', month: 'Mar', fajr: ['05:12', '05:40'], dhuhr: ['13:09', '13:15'], asr: ['16:30', '17:00'], maghrib: ['19:48', '19:53'], isha: ['21:15', '21:45'] },
      { day: 'Sat', date: '15', month: 'Mar', fajr: ['05:10', '05:40'], dhuhr: ['13:09', '13:30'], asr: ['16:31', '17:00'], maghrib: ['19:50', '19:55'], isha: ['21:15', '21:45'] },
      { day: 'Sun', date: '16', month: 'Mar', fajr: ['05:08', '05:40'], dhuhr: ['13:08', '13:30'], asr: ['16:32', '17:00'], maghrib: ['19:52', '19:57'], isha: ['21:15', '21:45'] },
    ]),

    // Ramadan
    Ramadan.insertMany(computeRamadan()),

    // Eid
    Eid.insertMany([
      {
        type: 'fitr', name: 'Eid-ul-Fitr', arabic: 'عيد الفطر', date: '30 March 2025 (Moon Sighting)',
        jamats: ['07:30 AM', '08:30 AM', '09:30 AM'], venue: 'Al-Falah Main Hall + Car Park',
        note: 'Bring your prayer mat. Zakat-ul-Fitr must be paid before prayer.', isLive: false
      },
      {
        type: 'adha', name: 'Eid-ul-Adha', arabic: 'عيد الأضحى', date: '6 June 2025 (Moon Sighting)',
        jamats: ['07:00 AM', '08:00 AM', '09:00 AM'], venue: 'Al-Falah Main Hall + Car Park',
        note: 'Qurbani bookings available. Contact the office for arrangements.', isLive: false
      },
    ]),

    // Announcements
    require('../models').Announcement.insertMany([
      { title: 'Ramadan Special Arrangements', body: "Al-Falah Masjid will be open 24/7 during Ramadan. Taraweeh at 9:45 PM nightly.", urgent: true, tag: 'Ramadan', date: '15 Mar' },
      { title: "This Friday's Khutba Topic", body: 'Topic: "Gratitude and its Virtues in Islam." Delivered by Sheikh Abdul Rahman.', urgent: false, tag: "Jumu'ah", date: '13 Mar' },
      { title: 'Islamic School Enrolment', body: 'Accepting enrolments for 2025–26. Classes for ages 5–16.', urgent: false, tag: 'Education', date: '10 Mar' },
      { title: 'Car Park Notice', body: 'Do not park on Highfield Road during prayer times.', urgent: true, tag: 'Notice', date: '8 Mar' },
      { title: 'Zakat-ul-Fitr Amount 2025', body: 'Zakat-ul-Fitr is set at £5 per person. Pay before Eid prayer.', urgent: false, tag: 'Zakat', date: '5 Mar' },
    ]),

    // Masjid
    Masjid.create({
      name: 'Jama Masjid Ahle Hadith', arabic: 'جامع مسجد اہل حدیث',
      address: 'Mumbai, India',
      phone: '', email: '', whatsapp: '',
      mapsUrl: '',
      about: "Jama Masjid Ahle Hadith has been serving the Muslim community of Mumbai.",
    }),

    // Ticker
    Ticker.create({
      items: [
        'Welcome to Al-Falah Masjid — May Allah accept your prayers',
        'Jumma Mubarak — Send Durood abundantly on Fridays',
        'Taraweeh prayers at 9:45 PM every night in Ramadan',
        'Zakat-ul-Fitr: £5 per person — pay before Eid Salah',
      ]
    }),

    // LiveAzan
    LiveAzan.create({ isLive: false, channelName: 'alfahees-azan' }),
  ]);

  console.log('✅ Database seeded.');
};
