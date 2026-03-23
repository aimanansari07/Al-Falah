export const MASJID = {
  name: 'Jama Masjid Ahle Hadith',
  arabic: 'جامع مسجد اہل حدیث',
  address: 'Mumbai, India',
  phone: '',
  whatsapp: '',
  email: '',
  mapsUrl: '',
  about: 'Jama Masjid Ahle Hadith has been serving the Muslim community of Mumbai. We provide daily Salah, Friday Jumu\'ah, Islamic education, and community services. Our doors are open to all.',
};

export const PRAYERS = {
  fajr: { name: 'Fajr', arabic: 'فجر', azan: '05:18', jamat: '05:45', qazaEnd: '07:30', icon: '🌙' },
  sunrise: { name: 'Sunrise', arabic: 'شروق', azan: '06:52', jamat: null, qazaEnd: null, icon: '🌅' },
  dhuhr: { name: 'Dhuhr', arabic: 'ظہر', azan: '13:10', jamat: '13:30', qazaEnd: '14:45', icon: '☀️' },
  asr: { name: 'Asr', arabic: 'عصر', azan: '16:25', jamat: '17:00', qazaEnd: '18:30', icon: '🌤' },
  maghrib: { name: 'Maghrib', arabic: 'مغرب', azan: '19:42', jamat: '19:47', qazaEnd: '21:00', icon: '🌆' },
  isha: { name: 'Isha', arabic: 'عشاء', azan: '21:15', jamat: '21:45', qazaEnd: '23:59', icon: '🌃' },
  tahajjud: { name: 'Tahajjud', arabic: 'تہجد', azan: '03:30', jamat: null, qazaEnd: null, icon: '⭐' },
};

export const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const MAKRUH = [
  { name: 'Sunrise (Ishraq)', arabic: 'وقت الشروق', start: '06:52', end: '07:22', note: '20 min after sunrise' },
  { name: 'Zawal (Midday)', arabic: 'وقت الزوال', start: '13:05', end: '13:15', note: 'Sun at zenith' },
  { name: 'Sunset (Gharub)', arabic: 'وقت الغروب', start: '19:22', end: '19:42', note: '20 min before Maghrib' },
];

export const JUMMA = {
  azan1: '12:30',   // Azan before 1st Jamat
  jamat1: '13:00',   // 1st Jamat
  azan2: '13:30',   // Azan before 2nd Jamat
  jamat2: '14:00',   // 2nd Jamat
  note: 'Please arrive early. Gates open from 12:00.',
};

export const WEEKLY = [
  { day: 'Sun', date: '22', month: 'Mar', fajr: ['05:08', '05:40'], dhuhr: ['13:08', '13:30'], asr: ['16:32', '17:00'], maghrib: ['19:52', '19:57'], isha: ['21:15', '21:45'] },
  { day: 'Mon', date: '23', month: 'Mar', fajr: ['05:06', '05:40'], dhuhr: ['13:08', '13:30'], asr: ['16:33', '17:00'], maghrib: ['19:54', '19:59'], isha: ['21:15', '21:45'] },
  { day: 'Tue', date: '24', month: 'Mar', fajr: ['05:04', '05:38'], dhuhr: ['13:07', '13:30'], asr: ['16:34', '17:00'], maghrib: ['19:56', '20:01'], isha: ['21:15', '21:45'] },
  { day: 'Wed', date: '25', month: 'Mar', fajr: ['05:02', '05:38'], dhuhr: ['13:07', '13:30'], asr: ['16:35', '17:00'], maghrib: ['19:58', '20:03'], isha: ['21:15', '21:45'] },
  { day: 'Thu', date: '26', month: 'Mar', fajr: ['05:00', '05:35'], dhuhr: ['13:06', '13:30'], asr: ['16:36', '17:00'], maghrib: ['20:00', '20:05'], isha: ['21:15', '21:45'] },
  { day: 'Fri', date: '27', month: 'Mar', fajr: ['04:58', '05:35'], dhuhr: ['13:06', '13:15'], asr: ['16:37', '17:00'], maghrib: ['20:02', '20:07'], isha: ['21:15', '21:45'] },
  { day: 'Sat', date: '28', month: 'Mar', fajr: ['04:56', '05:35'], dhuhr: ['13:05', '13:30'], asr: ['16:38', '17:00'], maghrib: ['20:04', '20:09'], isha: ['21:15', '21:45'] },
];

export const RAMADAN = Array.from({ length: 30 }, (_, i) => {
  const d = i + 1;
  const sM = Math.max(0, 58 - Math.round(i * 0.5));
  const iM = 15 + Math.round(i * 0.7);
  const iH = iM >= 60 ? 19 : 18;
  const iFinal = iM >= 60 ? iM - 60 : iM;
  const dateNum = d <= 14 ? d + 1 : d - 14;
  const mon = d <= 14 ? 'Mar' : 'Apr';
  return {
    day: d,
    date: `${dateNum} ${mon}`,
    sehri: `04:${String(sM).padStart(2, '0')}`,
    iftar: `${iH}:${String(iFinal).padStart(2, '0')}`,
    taraweeh: '21:45',
  };
});

export const EID = {
  fitr: {
    name: 'Eid-ul-Fitr',
    arabic: 'عيد الفطر',
    date: '30 March 2025 (Moon Sighting)',
    jamats: ['07:30 AM', '08:30 AM', '09:30 AM'],
    venue: 'Jama Masjid Ahle Hadith Main Hall + Car Park',
    note: 'Bring your prayer mat. Zakat-ul-Fitr must be paid before prayer.',
    isLive: false,   // admin sets true on Eid day
  },
  adha: {
    name: 'Eid-ul-Adha',
    arabic: 'عيد الأضحى',
    date: '6 June 2025 (Moon Sighting)',
    jamats: ['07:00 AM', '08:00 AM', '09:00 AM'],
    venue: 'Jama Masjid Ahle Hadith Main Hall + Car Park',
    note: 'Qurbani bookings available. Contact the office for arrangements.',
    isLive: false,   // admin sets true on Eid day
  },
};

export const ANNOUNCEMENTS = [
  { id: 1, title: 'Ramadan Special Arrangements', body: 'Jama Masjid Ahle Hadith will be open 24/7 during Ramadan. Taraweeh at 9:45 PM nightly. I\'tikaf registrations now open — limited spaces available.', date: '15 Mar', urgent: true, tag: 'Ramadan' },
  { id: 2, title: 'This Friday\'s Khutba Topic', body: 'Topic: "Gratitude and its Virtues in Islam." Delivered by Sheikh Abdul Rahman. All are welcome.', date: '13 Mar', urgent: false, tag: 'Jumu\'ah' },
  { id: 3, title: 'Islamic School Enrolment', body: 'Jama Masjid Ahle Hadith Islamic School accepting enrolments for 2025–26. Classes for ages 5–16. Contact the office for details.', date: '10 Mar', urgent: false, tag: 'Education' },
  { id: 4, title: 'Car Park Notice', body: 'Do not park on Highfield Road during prayer times. Please use the designated car park on Green Lane.', date: '8 Mar', urgent: true, tag: 'Notice' },
  { id: 5, title: 'Zakat-ul-Fitr Amount 2025', body: 'Zakat-ul-Fitr is set at £5 per person. Please pay before Eid prayer. Collection boxes at the entrance.', date: '5 Mar', urgent: false, tag: 'Zakat' },
  { id: 6, title: 'Sisters\' Wudu Area Open', body: 'The renovated wudu area for sisters is now open on the first floor, accessible via the side entrance on Maple Street.', date: '1 Mar', urgent: false, tag: 'Facilities' },
];

export const TICKER = [
  'Welcome to Jama Masjid Ahle Hadith — May Allah accept your prayers',
  'Jumma Mubarak — Send Durood abundantly on Fridays',
  'Taraweeh prayers at 9:45 PM every night in Ramadan',
  'Zakat-ul-Fitr: £5 per person — pay before Eid Salah',
];

export const DEFAULT_SETTINGS = {
  azanAutoPlay: false,
  liveAzanNotif: true,
  announcementNotif: true,
  prayerReminder: true,
  reminderMins: '10',
  makruhAlert: true,
  language: 'en',
  textSize: 'md',
};
