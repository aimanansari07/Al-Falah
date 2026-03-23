import { useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate, useOutlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { useApp } from './context/AppContext';
import { useData } from './context/DataContext';
import { initPushNotifications } from './capacitor/notifications';

import BottomNav from './components/BottomNav';
import MenuSheet from './components/MenuSheet';

import Home            from './pages/Home';
import PrayerTimes     from './pages/PrayerTimes';
import SpecialPrayers  from './pages/SpecialPrayers';
import Announcements   from './pages/Announcements';
import WeeklySchedule  from './pages/WeeklySchedule';
import LiveAzan        from './pages/LiveAzan';
import About           from './pages/About';
import Settings        from './pages/Settings';
import AdminLogin         from './pages/admin/AdminLogin';
import AdminDashboard     from './pages/admin/AdminDashboard';
import AdminSetup         from './pages/admin/AdminSetup';
import ForgotPassword     from './pages/admin/ForgotPassword';
import MuazzinBroadcast   from './pages/MuazzinBroadcast';

function Guard({ children }) {
  const { isAdmin } = useApp();
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

// Global Android back button — covers ALL routes including admin pages
function useAndroidBackButton() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const lastPress = useRef(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let handle;
    CapApp.addListener('backButton', ({ canGoBack }) => {
      const path = location.pathname;
      if (path === '/') {
        // Double-tap to exit on home
        const now = Date.now();
        if (now - lastPress.current < 2000) {
          CapApp.exitApp();
        } else {
          lastPress.current = now;
        }
      } else if (path.startsWith('/admin/dashboard')) {
        // Stay on dashboard, don't navigate back
      } else if (canGoBack) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }).then(h => { handle = h; });
    return () => { handle?.remove(); };
  }, [location.pathname, navigate]);
}

// Layout shell — persists across all tab navigations
function AppShell() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const element   = useOutlet();
  const { settings } = useApp();
  const { liveAzan } = useData();
  const prevLiveRef = useRef(liveAzan?.isLive);

  useEffect(() => {
    initPushNotifications(navigate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global: when azan goes live and autoplay is on, navigate to live-azan + set intent flag
  useEffect(() => {
    const isNowLive = liveAzan?.isLive;
    if (!prevLiveRef.current && isNowLive && settings.azanAutoPlay) {
      if (location.pathname !== '/live-azan') {
        window.__azanAutoplayIntent = true;
        navigate('/live-azan');
      }
    }
    prevLiveRef.current = isNowLive;
  }, [liveAzan?.isLive]); // eslint-disable-line

  return (
    <div className="app-shell">
      <div className="flex-1 relative overflow-hidden">
        {/* key change triggers a fresh mount + enter animation on every navigation */}
        <motion.div
          key={location.pathname}
          className="absolute inset-0 flex flex-col"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {element}
        </motion.div>
        <MenuSheet />
      </div>
      <BottomNav />
    </div>
  );
}

function GlobalHandlers() {
  useAndroidBackButton();
  return null;
}

export default function App() {
  return (
    <>
    <GlobalHandlers />
    <Routes>
      {/* All tab pages share the persistent AppShell layout */}
      <Route element={<AppShell />}>
        <Route index            element={<Home />}           />
        <Route path="/prayers"       element={<PrayerTimes />}    />
        <Route path="/special"       element={<SpecialPrayers />} />
        <Route path="/announcements" element={<Announcements />}  />
        <Route path="/weekly"        element={<WeeklySchedule />} />
        <Route path="/live-azan"     element={<LiveAzan />}       />
        <Route path="/about"         element={<About />}          />
        <Route path="/settings"      element={<Settings />}       />
      </Route>

      {/* Admin — outside AppShell (no bottom nav) */}
      <Route path="/admin/login"           element={<AdminLogin />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/setup"           element={<AdminSetup />} />
      <Route path="/admin/dashboard"       element={<Guard><AdminDashboard /></Guard>} />

      {/* Muazzin broadcast page — no login required, token in URL */}
      <Route path="/muazzin/:token"        element={<MuazzinBroadcast />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
