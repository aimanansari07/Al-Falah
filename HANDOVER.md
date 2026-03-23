# Al-Falah Masjid App — Project Handover Document

> **Prepared for:** Product Owner / Future Developer
> **Project:** Jama Masjid Ahle Hadith — Community App
> **Date:** March 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Live URLs](#2-live-urls)
3. [Credentials & Accounts](#3-credentials--accounts)
4. [Tech Stack](#4-tech-stack)
5. [Architecture & Flow](#5-architecture--flow)
6. [Project Structure](#6-project-structure)
7. [Features](#7-features)
8. [API Endpoints](#8-api-endpoints)
9. [Environment Variables](#9-environment-variables)
10. [Deployment Guide](#10-deployment-guide)
11. [How to Make Updates](#11-how-to-make-updates)
12. [Android APK](#12-android-apk)
13. [Admin Panel Guide](#13-admin-panel-guide)
14. [Muazzin (Live Azan) Guide](#14-muazzin-live-azan-guide)
15. [Known Patterns & Notes](#15-known-patterns--notes)

---

## 1. Project Overview

A full-stack, mobile-first web app for **Jama Masjid Ahle Hadith** that delivers:

- Daily prayer times with live countdown
- Live Azan audio broadcast (muazzin → all listeners in real-time)
- Weekly, Ramadan, and Eid schedules
- Community announcements
- Admin dashboard to manage all content
- Android APK + PWA (installable on any device)
- Push notifications via Firebase (FCM)

---

## 2. Live URLs

| Service | URL |
|---------|-----|
| **Web App (PWA)** | https://al-falah-five.vercel.app |
| **Backend API** | https://al-falah-backend-0p6w.onrender.com |
| **Admin Panel** | https://al-falah-five.vercel.app/admin/login |
| **GitHub Repo** | https://github.com/aimanansari07/Al-Falah |
| **APK Download** | https://github.com/aimanansari07/Al-Falah/releases/download/v1.0.0/Al-Falah.apk |
| **Release Page** | https://github.com/aimanansari07/Al-Falah/releases/tag/v1.0.0 |
| **API Health Check** | https://al-falah-backend-0p6w.onrender.com/api/health |

---

## 3. Credentials & Accounts

> ⚠️ Keep this section confidential. Do not share publicly.

---

### Admin Panel

| Field | Value |
|-------|-------|
| URL | https://al-falah-five.vercel.app/admin/login |
| Username | `admin` |
| Default Password | `alfalah2025` |

> **Note:** On first login, the system will prompt you to set a new password and recovery email. After setup, the default password above will no longer work. The new password is whatever was set during first-time setup.
>
> **Forgot password?** Use the "Forgot Password" flow on the login page — an OTP is sent to the registered admin email.

---

### GitHub

| Field | Value |
|-------|-------|
| Account | aimanansari07 (personal) |
| Repo | https://github.com/aimanansari07/Al-Falah |
| Visibility | Public |

---

### Vercel (Frontend Hosting)

| Field | Value |
|-------|-------|
| Platform | https://vercel.com |
| Login | GitHub account (aimanansari07) |
| Project | al-falah |
| Auto-deploy | Yes — pushes to `main` branch deploy automatically |

**Environment Variables on Vercel:**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://al-falah-backend-0p6w.onrender.com` |
| `VITE_AGORA_APP_ID` | `07f9be2d9bcd414a8fcf14c733d3c754` |

---

### Render (Backend Hosting)

| Field | Value |
|-------|-------|
| Platform | https://render.com |
| Login | GitHub account (aimanansari07) |
| Service | Al-Falah Backend |
| Auto-deploy | Yes — pushes to `main` branch deploy automatically |

**Environment Variables on Render:**

| Key | Description |
|-----|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for JWT token signing |
| `AGORA_APP_ID` | `07f9be2d9bcd414a8fcf14c733d3c754` |
| `FIREBASE_PROJECT_ID` | Firebase project ID for FCM push notifications |
| `GMAIL_USER` | Gmail address used to send OTP emails |
| `GMAIL_PASS` | Gmail app password (not regular password) |
| `CORS_ORIGIN` | `https://al-falah-five.vercel.app,http://localhost:5173` |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `ADMIN_USER` | `admin` |
| `ADMIN_PASS` | `alfalah2025` (used only on first DB seed) |

---

### MongoDB Atlas

| Field | Value |
|-------|-------|
| Platform | https://cloud.mongodb.com |
| Database | MongoDB Atlas (cloud) |
| IP Whitelist | `0.0.0.0/0` (all IPs — required for Render) |

> **Note:** Login to MongoDB Atlas with the account used during setup to manage the database, view collections, or change the connection string.

---

### Agora (Live Audio)

| Field | Value |
|-------|-------|
| Platform | https://console.agora.io |
| App ID | `07f9be2d9bcd414a8fcf14c733d3c754` |
| Used for | Live Azan real-time audio broadcasting |
| Channel | `alfahees-azan` |

---

### Firebase (Push Notifications)

| Field | Value |
|-------|-------|
| Platform | https://console.firebase.google.com |
| Used for | FCM push notifications (live azan alerts, announcements) |
| Config file | `google-services.json` inside Android project |

---

## 4. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Framer Motion, React Router v6 |
| **Mobile** | Capacitor 6 (Android APK wrapper) |
| **Live Audio** | Agora RTC SDK |
| **Backend** | Node.js, Express |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT + bcrypt |
| **Push Notifications** | Firebase Cloud Messaging (FCM) |
| **Email (OTP)** | Nodemailer via Gmail SMTP |
| **PWA** | vite-plugin-pwa (service worker + manifest) |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |
| **Database Hosting** | MongoDB Atlas |

---

## 5. Architecture & Flow

### High-Level Flow

```
User (Browser / Android APK)
         │
         ▼
   Vercel (Frontend)
   React + Tailwind
         │
         │ REST API calls
         ▼
   Render (Backend)
   Express + MongoDB
         │
         ├── MongoDB Atlas (data storage)
         ├── Agora (live audio)
         └── Firebase (push notifications)
```

---

### Update/Deploy Flow

```
Developer (local changes)
         │
         │  git push
         ▼
     GitHub (main branch)
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
     Vercel                  Render
   (Frontend)              (Backend)
  auto-deploys            auto-deploys
   ~1 minute               ~1-2 minutes
         │                      │
         ▼                      ▼
  al-falah-five        al-falah-backend
  .vercel.app          -0p6w.onrender.com
```

> **Note:** APK does NOT auto-update. Must be rebuilt and re-uploaded to GitHub Releases manually.

---

### Live Azan Flow

```
Muazzin (phone/browser)
  Opens muazzin link → taps Start Broadcast
         │
         │ Agora RTC (audio stream)
         ▼
   Agora Cloud (relay)
         │
         ▼
  All listeners on app
  (auto-join if autoplay ON,
   or tap "Tap to Listen")
```

---

### Authentication Flow

```
Admin visits /admin/login
  → enters username + password
  → backend returns JWT token (8h expiry)
  → token stored in localStorage
  → all admin API calls send token in Authorization header
  → 5 failed attempts = 15 min lockout
```

---

## 6. Project Structure

```
Al-Falah/
├── frontend/                    ← React app + Android
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx             ← Dashboard with prayer countdown
│   │   │   ├── PrayerTimes.jsx      ← Today's full prayer times
│   │   │   ├── WeeklySchedule.jsx   ← 7-day timetable
│   │   │   ├── SpecialPrayers.jsx   ← Jumma / Ramadan / Eid
│   │   │   ├── LiveAzan.jsx         ← Listen to live azan
│   │   │   ├── Announcements.jsx    ← Community news
│   │   │   ├── About.jsx            ← Masjid info
│   │   │   ├── Settings.jsx         ← User preferences
│   │   │   ├── MuazzinBroadcast.jsx ← Muazzin broadcast page
│   │   │   └── admin/
│   │   │       ├── AdminLogin.jsx
│   │   │       └── AdminDashboard.jsx
│   │   ├── components/
│   │   │   ├── BottomNav.jsx        ← 5-tab navigation bar
│   │   │   ├── MenuSheet.jsx        ← Slide-up drawer (More menu)
│   │   │   └── MakruhAlert.jsx      ← Makruh time warning
│   │   ├── context/
│   │   │   ├── AppContext.jsx       ← Global settings + admin state
│   │   │   └── DataContext.jsx      ← All API data fetching
│   │   ├── lib/
│   │   │   └── agora.js             ← Agora RTC logic (broadcast + listen)
│   │   ├── capacitor/
│   │   │   └── notifications.js     ← Push notification setup
│   │   ├── utils/
│   │   │   └── prayerUtils.js       ← Prayer time helpers + Hijri date
│   │   └── App.jsx                  ← Router + back button + push init
│   ├── scripts/
│   │   ├── build-apk.sh             ← Debug APK build + USB install
│   │   └── build-release-apk.sh     ← Release APK build
│   ├── capacitor.config.ts          ← App ID: com.alfalah.masjid
│   └── .env                         ← API URL + Agora App ID
│
└── backend/                     ← Express API
    └── src/
        ├── app.js                   ← Express setup + CORS + routes
        ├── server.js                ← Entry point + DB connect
        ├── routes/                  ← All API route files
        ├── models/                  ← Mongoose schemas
        ├── middleware/
        │   ├── auth.js              ← JWT verification middleware
        │   └── errorHandler.js      ← Global error handler
        ├── utils/
        │   ├── mailer.js            ← OTP email via Gmail
        │   └── firebase.js          ← FCM push notifications
        └── db/
            ├── connection.js        ← MongoDB connect
            └── seed.js              ← Initial data seeding
```

---

## 7. Features

| Feature | Description |
|---------|-------------|
| **Prayer Times** | Daily Fajr, Dhuhr, Asr, Maghrib, Isha with Azan & Jamat times. Live countdown to next prayer. |
| **Live Azan** | Real-time audio via Agora RTC. Muazzin broadcasts, everyone listens instantly. |
| **Weekly Schedule** | Full 7-day prayer timetable. |
| **Special Prayers** | Jumma times (2 slots), Ramadan sehri/iftar/taraweeh, Eid schedules. |
| **Announcements** | Admin posts community news. Urgent alerts highlighted in red. |
| **Makruh Times** | Warning banner during prohibited prayer times (sunrise, zawal, sunset). |
| **Hijri Date** | Islamic calendar date shown on home screen. |
| **Admin Dashboard** | Full content management — update all data without touching code. |
| **Muazzin Panel** | Token-based page, no login. Muazzin opens link, taps broadcast. |
| **Push Notifications** | FCM alerts for live azan going live and new announcements. |
| **PWA** | Installable on iPhone/Android from browser. Works offline (cached data). |
| **Android APK** | Native app via Capacitor. Distributed via GitHub Releases. |
| **News Ticker** | Scrolling ticker on home screen with custom messages. |

---

## 8. API Endpoints

### Public (no auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/prayers` | Today's prayer times |
| GET | `/api/prayers/jumma` | Jumma times |
| GET | `/api/weekly` | Weekly schedule |
| GET | `/api/ramadan` | Ramadan timetable |
| GET | `/api/eid` | Eid schedules |
| GET | `/api/announcements` | Announcements list |
| GET | `/api/masjid` | Masjid info |
| GET | `/api/ticker` | News ticker items |
| GET | `/api/live-azan` | Live azan status |
| GET | `/api/makruh` | Makruh prayer times |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login → returns JWT |
| POST | `/api/auth/setup` | First-time password setup |
| PUT | `/api/auth/change-password` | Change password (requires JWT) |
| POST | `/api/auth/forgot-password` | Send OTP to registered email |
| POST | `/api/auth/verify-otp` | Verify OTP → returns reset token |
| POST | `/api/auth/reset-password` | Reset password with reset token |

### Admin (JWT required in Authorization header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/prayers` | Update prayer times |
| PUT | `/api/prayers/jumma` | Update Jumma times |
| PUT | `/api/weekly` | Update weekly schedule |
| PUT | `/api/ramadan` | Update Ramadan timetable |
| PUT | `/api/eid/:type` | Update Eid schedule (fitr / adha) |
| POST | `/api/announcements` | Create announcement |
| DELETE | `/api/announcements/:id` | Delete announcement |
| PUT | `/api/masjid` | Update masjid info |
| PUT | `/api/ticker` | Update ticker items |
| PUT | `/api/live-azan` | Update live azan settings |
| GET | `/api/live-azan/muazzin-token` | Get current muazzin token |
| POST | `/api/live-azan/muazzin-token` | Generate new muazzin token |

### Muazzin (token in URL, no login)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/live-azan/muazzin/:token/verify` | Verify token is valid |
| PUT | `/api/live-azan/muazzin/:token` | Toggle live on/off |

---

## 9. Environment Variables

### Frontend (`frontend/.env`)

```
VITE_API_URL=https://al-falah-backend-0p6w.onrender.com
VITE_APP_URL=https://al-falah-five.vercel.app
VITE_AGORA_APP_ID=07f9be2d9bcd414a8fcf14c733d3c754
```

### Backend (`backend/.env`)

```
MONGODB_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<random string, min 32 chars>
AGORA_APP_ID=07f9be2d9bcd414a8fcf14c733d3c754
FIREBASE_PROJECT_ID=<your Firebase project ID>
GMAIL_USER=<gmail address>
GMAIL_PASS=<gmail app password>
CORS_ORIGIN=https://al-falah-five.vercel.app,http://localhost:5173
PORT=3000
NODE_ENV=production
ADMIN_USER=admin
ADMIN_PASS=alfalah2025
```

---

## 10. Deployment Guide

### Frontend — Vercel

- Connected to GitHub repo (`main` branch)
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Every `git push` to `main` triggers automatic redeploy

### Backend — Render

- Connected to GitHub repo (`main` branch)
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Every `git push` to `main` triggers automatic redeploy
- Free tier sleeps after 15 min inactivity — first request may take ~30s to wake up

### Database — MongoDB Atlas

- Cloud-hosted MongoDB
- IP whitelist: `0.0.0.0/0` (required for Render's dynamic IPs)
- Database is seeded automatically on first startup if empty

---

## 11. How to Make Updates

### Update web content (prayers, announcements, etc.)
→ Log in to Admin Panel at `https://al-falah-five.vercel.app/admin/login`
→ No code changes needed

### Update code and deploy

```bash
# 1. Make your changes locally
# 2. Run dev server to test
cd frontend && npm run dev

# 3. Push to GitHub
git add .
git commit -m "describe your change"
git push

# Vercel and Render auto-deploy within 1-2 minutes
```

### Update Android APK

```bash
cd frontend

# 1. Build + sync + install on connected USB phone
npm run apk:debug

# 2. Upload new release to GitHub (change version number each time)
gh release create v1.0.1 \
  android/app/build/outputs/apk/debug/app-debug.apk#"Al-Falah.apk" \
  --repo aimanansari07/Al-Falah \
  --title "v1.0.1 — Al-Falah Masjid App" \
  --notes "What changed in this version"
```

### Run locally

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in values
npm run dev            # runs on http://localhost:3000

# Frontend (new terminal)
cd frontend
npm install
npm run dev            # runs on http://localhost:5173
```

---

## 12. Android APK

| Setting | Value |
|---------|-------|
| App ID | `com.alfalah.masjid` |
| Min Android | 5.1 (API 22) — covers ~99% of devices |
| Target Android | 14 (API 34) |
| Current version | v1.0.0 (debug) |
| APK location | `frontend/android/app/build/outputs/apk/debug/app-debug.apk` |
| Download link | https://github.com/aimanansari07/Al-Falah/releases/download/v1.0.0/Al-Falah.apk |

**To install on a phone:**
1. Download `Al-Falah.apk`
2. Tap the file to install
3. If prompted, enable "Install from unknown sources"
4. Tap Install

**To install via USB (developer):**
```bash
cd frontend
npm run apk:debug    # builds + installs automatically via ADB
```

---

## 13. Admin Panel Guide

**URL:** `https://al-falah-five.vercel.app/admin/login`

### First-Time Login
1. Enter username: `admin`, password: `alfalah2025`
2. You will be redirected to setup — enter your email and set a new password
3. Store your new password safely — this replaces the default

### What you can manage
- **Prayer Times** — update Azan & Jamat times for all prayers
- **Jumma** — update both Jumma slots + note
- **Weekly Schedule** — update the 7-day timetable
- **Ramadan** — update sehri/iftar times for each day
- **Eid** — update Eid-ul-Fitr and Eid-ul-Adha details
- **Announcements** — post/delete community news (mark as urgent for red highlight)
- **Ticker** — edit the scrolling news ticker messages
- **Masjid Info** — update name, address, phone, email, about text
- **Live Azan** — generate muazzin token link

### Security
- JWT token expires after 8 hours — you will be logged out automatically
- 5 failed login attempts = 15 minute lockout
- Forgot password: uses OTP sent to registered email

---

## 14. Muazzin (Live Azan) Guide

### Setup (Admin does this once)
1. Log in to Admin Panel
2. Go to **Live Azan** section
3. Click **Generate Muazzin Link**
4. Copy the link and send it to the muazzin (via WhatsApp)

### Muazzin Instructions
1. Open the link in **Chrome** (not inside WhatsApp — tap 3 dots → Open in Chrome)
2. Allow microphone permission when asked
3. Tap **Start Broadcast** when ready to begin azan
4. Tap **Stop** when done

### Listener Experience
- App users will see a green "Live Azan" banner on Home screen
- If **Auto-play** is ON in Settings → audio starts automatically
- If Auto-play is OFF → tap "Tap to Listen" on Live Azan page

---

## 15. Known Patterns & Notes

| Topic | Note |
|-------|------|
| **Render cold start** | Backend on free tier sleeps after 15 min. First request after sleep takes ~30 seconds. Upgrade to paid plan to avoid this. |
| **Agora channel name** | Fixed as `alfahees-azan` in the database. Change via Admin Panel → Live Azan settings if needed. |
| **Muazzin browser** | Must use Chrome on Android. Safari/in-app browsers may block microphone access. |
| **APK vs PWA** | PWA (web) updates automatically on `git push`. APK must be rebuilt and re-shared manually. |
| **CORS** | Only `https://al-falah-five.vercel.app` and `http://localhost:5173` are whitelisted. If frontend URL changes, update `CORS_ORIGIN` on Render. |
| **MongoDB seed** | Database is seeded once on first startup. To re-seed, delete all documents from MongoDB Atlas and restart the backend. |
| **Hijri date** | Currently shows a static mock date. To make it dynamic, replace `getHijri()` in `prayerUtils.js` with a live API call. |
| **Push notifications** | Requires a real Firebase setup with `google-services.json` in the Android project. FCM token is logged to console on first app launch. |
| **Admin lockout** | If locked out and no email is set (first-time setup not completed), you must reset the admin document directly in MongoDB Atlas. |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│              AL-FALAH QUICK REFERENCE                │
├─────────────────────────────────────────────────────┤
│ Web App    → https://al-falah-five.vercel.app        │
│ Admin      → /admin/login  (admin / alfalah2025)     │
│ Backend    → https://al-falah-backend-0p6w.onrender.com │
│ GitHub     → github.com/aimanansari07/Al-Falah       │
│ APK        → /releases/download/v1.0.0/Al-Falah.apk  │
├─────────────────────────────────────────────────────┤
│ Deploy     → git push (auto-deploys Vercel + Render) │
│ APK build  → cd frontend && npm run apk:debug        │
│ Local dev  → npm run dev (frontend + backend)        │
└─────────────────────────────────────────────────────┘
```

---

*Document created March 2026 — Al-Falah Masjid App v1.0.0*
