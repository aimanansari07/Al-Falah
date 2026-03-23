const router    = require('express').Router();
const { Eid }   = require('../models');
const auth      = require('../middleware/auth');

function docToEid(doc) {
  return {
    name:   doc.name,
    arabic: doc.arabic,
    date:   doc.date,
    jamats: doc.jamats,
    venue:  doc.venue,
    note:   doc.note,
    isLive: doc.isLive,
  };
}

// GET /api/eid
router.get('/', async (req, res, next) => {
  try {
    const docs = await Eid.find({}).lean();
    const result = {};
    for (const doc of docs) result[doc.type] = docToEid(doc);
    res.json(result);
  } catch (err) { next(err); }
});

// PUT /api/eid/:type  — admin
router.put('/:type', auth, async (req, res, next) => {
  try {
    const { type } = req.params;
    if (!['fitr', 'adha'].includes(type))
      return res.status(400).json({ error: 'Invalid type' });
    const { date, jamats, venue, note, isLive } = req.body;
    await Eid.updateOne({ type }, { $set: { date, jamats, venue, note, isLive } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
