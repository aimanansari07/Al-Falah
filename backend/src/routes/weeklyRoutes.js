const router      = require('express').Router();
const { Weekly }  = require('../models');
const auth        = require('../middleware/auth');

// GET /api/weekly
router.get('/', async (req, res, next) => {
  try {
    const docs = await Weekly.find({}).lean();
    res.json(docs.map(({ day, date, month, fajr, dhuhr, asr, maghrib, isha }) => ({
      day, date, month, fajr, dhuhr, asr, maghrib, isha,
    })));
  } catch (err) { next(err); }
});

// PUT /api/weekly  — admin (replace all 7 rows)
router.put('/', auth, async (req, res, next) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected array' });
    await Weekly.deleteMany({});
    await Weekly.insertMany(items);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
