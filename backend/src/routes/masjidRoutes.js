const router      = require('express').Router();
const { Masjid }  = require('../models');
const auth        = require('../middleware/auth');

// GET /api/masjid
router.get('/', async (req, res, next) => {
  try {
    const doc = await Masjid.findOne({}).lean();
    res.json({
      name:         doc.name,
      arabic:       doc.arabic,
      address:      doc.address,
      phone:        doc.phone,
      email:        doc.email,
      whatsapp:     doc.whatsapp,
      mapsUrl:      doc.mapsUrl,
      about:        doc.about,
      ramadanMode:  !!doc.ramadanMode,
    });
  } catch (err) { next(err); }
});

// PUT /api/masjid  — admin
router.put('/', auth, async (req, res, next) => {
  try {
    const { name, arabic, address, phone, email, whatsapp, mapsUrl, about, ramadanMode } = req.body;
    const update = { name, arabic, address, phone, email, whatsapp, mapsUrl, about };
    if (ramadanMode !== undefined) update.ramadanMode = ramadanMode;
    await Masjid.updateOne({}, { $set: update });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
