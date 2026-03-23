require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const app          = require('./app');
const { connect }  = require('./db/connection');
const seed         = require('./db/seed');

const PORT = process.env.PORT || 3000;

(async () => {
  await connect();
  await seed();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Al-Falah API running on http://localhost:${PORT}`);
    console.log(`📱 Mobile access: http://192.168.0.100:${PORT}`);
    const origins = process.env.CORS_ORIGIN || 'all origins';
    console.log(`🌐 CORS: ${origins}`);
  });
})();
