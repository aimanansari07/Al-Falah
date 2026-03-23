const router    = require('express').Router();
const { FCMToken } = require('../models');

// POST /api/fcm/token  — device registers its FCM token
router.post('/token', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });
    await FCMToken.updateOne({ token }, { $set: { token, updatedAt: new Date() } }, { upsert: true });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
