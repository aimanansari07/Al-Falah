const router                = require('express').Router();
const crypto                = require('crypto');
const { LiveAzan, FCMToken } = require('../models');
const auth                  = require('../middleware/auth');
const { sendPush }          = require('../utils/firebase');

// GET /api/live-azan  — public (app users polling status)
router.get('/', async (req, res, next) => {
  try {
    const doc = await LiveAzan.findOne({}).lean();
    res.json({ isLive: doc.isLive, channelName: doc.channelName });
  } catch (err) { next(err); }
});

// PUT /api/live-azan  — admin only
router.put('/', auth, async (req, res, next) => {
  try {
    const { isLive, channelName } = req.body;
    const fields = {};
    const wasLive = (await LiveAzan.findOne({}).lean())?.isLive;
    if (isLive      !== undefined) fields.isLive      = isLive;
    if (channelName !== undefined) fields.channelName = channelName;
    await LiveAzan.updateOne({}, { $set: fields });
    res.json({ success: true });

    // Notify all devices when stream goes live
    if (isLive && !wasLive) {
      const tokens = (await FCMToken.find({}).lean()).map(t => t.token);
      sendPush(tokens, {
        title: '🕌 Live Azan',
        body: 'The Azan is being called live now. Tap to listen.',
        data: { route: '/live-azan' },
      });
    }
  } catch (err) { next(err); }
});

// POST /api/live-azan/muazzin-token  — admin generates/regenerates muazzin link token
router.post('/muazzin-token', auth, async (req, res, next) => {
  try {
    const token = crypto.randomBytes(24).toString('hex');
    await LiveAzan.updateOne({}, { $set: { muazzinToken: token } }, { upsert: true });
    res.json({ muazzinToken: token });
  } catch (err) { next(err); }
});

// GET /api/live-azan/muazzin-token  — admin fetches current token
router.get('/muazzin-token', auth, async (req, res, next) => {
  try {
    const doc = await LiveAzan.findOne({}).lean();
    res.json({ muazzinToken: doc?.muazzinToken || null });
  } catch (err) { next(err); }
});

// GET /api/live-azan/muazzin/:token/verify  — muazzin page validates its token
router.get('/muazzin/:token/verify', async (req, res, next) => {
  try {
    const doc = await LiveAzan.findOne({}).lean();
    if (!doc?.muazzinToken || doc.muazzinToken !== req.params.token) {
      return res.status(403).json({ error: 'Invalid or expired link' });
    }
    res.json({ valid: true, channelName: doc.channelName, isLive: doc.isLive });
  } catch (err) { next(err); }
});

// PUT /api/live-azan/muazzin/:token  — muazzin starts/stops stream (no admin JWT needed)
router.put('/muazzin/:token', async (req, res, next) => {
  try {
    const doc = await LiveAzan.findOne({}).lean();
    if (!doc?.muazzinToken || doc.muazzinToken !== req.params.token) {
      return res.status(403).json({ error: 'Invalid or expired link' });
    }
    const { isLive } = req.body;
    const wasLive2 = doc?.isLive;
    if (isLive !== undefined) await LiveAzan.updateOne({}, { $set: { isLive } });
    res.json({ success: true });

    if (isLive && !wasLive2) {
      const tokens = (await FCMToken.find({}).lean()).map(t => t.token);
      sendPush(tokens, {
        title: '🕌 Live Azan',
        body: 'The Azan is being called live now. Tap to listen.',
        data: { route: '/live-azan' },
      });
    }
  } catch (err) { next(err); }
});

module.exports = router;
