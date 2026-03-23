const router           = require('express').Router();
const { Prayer, Jumma } = require('../models');
const auth             = require('../middleware/auth');

const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'tahajjud'];

function docToObj(doc) {
  return {
    name:    doc.name,
    arabic:  doc.arabic,
    azan:    doc.azan,
    jamat:   doc.jamat   || null,
    qazaEnd: doc.qazaEnd || null,
    icon:    doc.icon,
  };
}

// GET /api/prayers
router.get('/', async (req, res, next) => {
  try {
    const docs = await Prayer.find({}).lean();
    const map  = {};
    for (const doc of docs) map[doc.key] = docToObj(doc);
    const ordered = {};
    for (const k of PRAYER_ORDER) if (map[k]) ordered[k] = map[k];
    res.json(ordered);
  } catch (err) { next(err); }
});

// PUT /api/prayers  — admin
router.put('/', auth, async (req, res, next) => {
  try {
    const updates = req.body; // { fajr: { azan, jamat, qazaEnd }, ... }
    const ops = Object.entries(updates).map(([key, val]) =>
      Prayer.updateOne({ key }, { $set: {
        ...(val.azan    !== undefined && { azan:    val.azan }),
        ...(val.jamat   !== undefined && { jamat:   val.jamat }),
        ...(val.qazaEnd !== undefined && { qazaEnd: val.qazaEnd }),
      }})
    );
    await Promise.all(ops);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/prayers/jumma
router.get('/jumma', async (req, res, next) => {
  try {
    const doc = await Jumma.findOne({}).lean();
    res.json({ azan1: doc.azan1, jamat1: doc.jamat1, azan2: doc.azan2, jamat2: doc.jamat2, note: doc.note });
  } catch (err) { next(err); }
});

// PUT /api/prayers/jumma  — admin
router.put('/jumma', auth, async (req, res, next) => {
  try {
    const { azan1, jamat1, azan2, jamat2, note } = req.body;
    await Jumma.updateOne({}, { $set: { azan1, jamat1, azan2, jamat2, note } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
