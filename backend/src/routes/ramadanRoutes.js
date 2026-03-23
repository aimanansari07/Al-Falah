const router       = require('express').Router();
const { Ramadan }  = require('../models');
const auth         = require('../middleware/auth');

// GET /api/ramadan
router.get('/', async (req, res, next) => {
  try {
    const docs = await Ramadan.find({}).sort({ day: 1 }).lean();
    res.json(docs.map(({ day, date, sehri, iftar, taraweeh }) => ({ day, date, sehri, iftar, taraweeh })));
  } catch (err) { next(err); }
});

// PUT /api/ramadan  — admin (replace all rows)
router.put('/', auth, async (req, res, next) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected array' });
    await Ramadan.deleteMany({});
    await Ramadan.insertMany(items);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
