const router              = require('express').Router();
const { Announcement, FCMToken } = require('../models');
const auth                = require('../middleware/auth');
const { sendPush }        = require('../utils/firebase');

// GET /api/announcements
router.get('/', async (req, res, next) => {
  try {
    const docs = await Announcement.find({}).sort({ createdAt: -1 }).lean();
    res.json(docs.map(({ _id, ...rest }) => ({ id: _id, ...rest })));
  } catch (err) { next(err); }
});

// POST /api/announcements  — admin
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, body, urgent = false, tag = 'Notice', date } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'title and body required' });
    const displayDate = date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const doc = await Announcement.create({ title, body, urgent, tag, date: displayDate });
    res.status(201).json({ id: doc._id, title, body, urgent, tag, date: displayDate });

    // Send push notification to all devices
    const tokens = (await FCMToken.find({}).lean()).map(t => t.token);
    sendPush(tokens, {
      title: urgent ? `🔴 ${title}` : title,
      body,
      data: { route: '/announcements' },
    });
  } catch (err) { next(err); }
});

// PUT /api/announcements/:id  — admin
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, body, urgent, tag, date } = req.body;
    const doc = await Announcement.findByIdAndUpdate(
      id,
      { $set: {
        ...(title  !== undefined && { title }),
        ...(body   !== undefined && { body }),
        ...(urgent !== undefined && { urgent }),
        ...(tag    !== undefined && { tag }),
        ...(date   !== undefined && { date }),
      }},
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE /api/announcements/:id  — admin
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const doc = await Announcement.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
