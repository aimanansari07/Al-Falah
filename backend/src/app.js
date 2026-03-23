const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');

const app = express();

app.use(helmet());
app.use(cors({ origin: (origin, cb) => cb(null, true) }));
app.use(express.json());

// Request logger (skip in test)
if (process.env.NODE_ENV !== 'test') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} — origin: ${req.headers.origin || 'none'} — ip: ${req.ip}`);
    next();
  });
}

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'Al-Falah API' }));

// Routes
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/prayers',       require('./routes/prayerRoutes'));
app.use('/api/makruh',        require('./routes/makruhRoutes'));
app.use('/api/weekly',        require('./routes/weeklyRoutes'));
app.use('/api/ramadan',       require('./routes/ramadanRoutes'));
app.use('/api/eid',           require('./routes/eidRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/masjid',        require('./routes/masjidRoutes'));
app.use('/api/ticker',        require('./routes/tickerRoutes'));
app.use('/api/live-azan',     require('./routes/liveAzanRoutes'));
app.use('/api/fcm',           require('./routes/fcmRoutes'));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use(require('./middleware/errorHandler'));

module.exports = app;
