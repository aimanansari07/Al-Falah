const router      = require('express').Router();
const { Makruh }  = require('../models');
const auth        = require('../middleware/auth');

// GET /api/makruh
router.get('/', async (req, res, next) => {
  try {
    const docs = await Makruh.find({}).lean();
    res.json(docs.map(({ name, arabic, start, end, note }) => ({ name, arabic, start, end, note })));
  } catch (err) { next(err); }
});

// PUT /api/makruh  — admin (replace all)
router.put('/', auth, async (req, res, next) => {
  try {
    const items = req.body; // array of { name, arabic, start, end, note }
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected array' });
    await Makruh.deleteMany({});
    await Makruh.insertMany(items);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
