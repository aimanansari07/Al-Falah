const router      = require('express').Router();
const { Ticker }  = require('../models');
const auth        = require('../middleware/auth');

// GET /api/ticker
router.get('/', async (req, res, next) => {
  try {
    const doc = await Ticker.findOne({}).lean();
    res.json({ items: doc ? doc.items : [] });
  } catch (err) { next(err); }
});

// PUT /api/ticker  — admin (replace all)
router.put('/', auth, async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected { items: [] }' });
    await Ticker.updateOne({}, { $set: { items } }, { upsert: true });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
