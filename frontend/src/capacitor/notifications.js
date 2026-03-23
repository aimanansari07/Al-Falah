import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

/** Read azanAutoPlay setting from localStorage (avoids passing React context into utility) */
function isAutoPlayEnabled() {
  try {
    return JSON.parse(localStorage.getItem('af_settings') || '{}').azanAutoPlay === true;
  } catch { return false; }
}

/**
 * Initialise push notifications.
 * Call once on app startup (inside AppContext or App.jsx).
 * @param {function} navigate - react-router navigate function
 */
export async function initPushNotifications(navigate) {
  // Only run on a real Android/iOS device
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Request permission
    const { receive } = await PushNotifications.requestPermissions();
    if (receive !== 'granted') {
      console.warn('[Push] Permission denied');
      return;
    }

    // Register with FCM (triggers 'registration' event below)
    await PushNotifications.register();

    // FCM token received — save to backend
    PushNotifications.addListener('registration', ({ value: token }) => {
      console.log('[Push] FCM token:', token);
      const base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      fetch(`${base}/api/fcm/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).catch(e => console.warn('[Push] Token save failed:', e.message));
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('[Push] Registration error:', err.error);
    });

    // Notification received while app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Foreground notification:', notification.title);
      // Live azan started — navigate and set autoplay intent if enabled
      if (notification.data?.type === 'live_azan' && isAutoPlayEnabled()) {
        window.__azanAutoplayIntent = true;
        navigate?.('/live-azan');
      }
    });

    // User tapped a notification (app in background or closed)
    PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
      const route = notification.data?.route;
      // If tapping a live-azan notification and autoplay is on, set intent so LiveAzan auto-joins
      if (route === '/live-azan' && isAutoPlayEnabled()) {
        window.__azanAutoplayIntent = true;
      }
      if (route && navigate) {
        navigate(route);
      }
    });
  } catch (err) {
    console.error('[Push] Init failed:', err);
  }
}

/**
 * Remove all push notification listeners.
 * Call on unmount if needed.
 */
export async function removePushListeners() {
  if (!Capacitor.isNativePlatform()) return;
  await PushNotifications.removeAllListeners();
}
