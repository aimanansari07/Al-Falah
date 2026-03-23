const admin = require('firebase-admin');
const path  = require('path');

let initialized = false;

function getFirebase() {
  if (!initialized) {
    try {
      const serviceAccount = require(path.join(process.cwd(), 'serviceAccount.json'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      initialized = true;
      console.log('✅ Firebase Admin initialized');
    } catch (e) {
      console.warn('⚠️  Firebase Admin init failed:', e.message);
    }
  }
  return initialized ? admin : null;
}

/**
 * Send a push notification to one or more FCM tokens.
 * @param {string[]} tokens
 * @param {object}   payload  { title, body, data }
 */
async function sendPush(tokens, { title, body, data = {} }) {
  const fb = getFirebase();
  if (!fb || !tokens?.length) return;

  const message = {
    notification: { title, body },
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    android: {
      priority: 'high',
      notification: { sound: 'default', channelId: 'default' },
    },
    tokens,
  };

  try {
    const res = await fb.messaging().sendEachForMulticast(message);
    console.log(`[FCM] Sent: ${res.successCount} ok, ${res.failureCount} failed`);
  } catch (e) {
    console.error('[FCM] Send error:', e.message);
  }
}

module.exports = { sendPush };
