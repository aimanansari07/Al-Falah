# Al-Falah Masjid App

A full-stack, mobile-first web app for **Jama Masjid Ahle Hadith** — delivering prayer times, live Azan broadcasting, announcements, and mosque management to the community.

---

## Features

- **Prayer Times** — Daily azan & jamat times with live countdown
- **Live Azan** — Real-time audio broadcast via Agora RTC (muazzin → listeners)
- **Weekly Schedule** — Full 7-day prayer timetable
- **Special Prayers** — Jumma, Ramadan, Eid schedules
- **Announcements** — Admin-managed news & urgent alerts
- **Admin Dashboard** — Secure panel to manage all content
- **Muazzin Panel** — Token-based broadcast page (no login required)
- **Push Notifications** — FCM alerts for live Azan & announcements
- **Hijri Date** — Automatic Islamic calendar display
- **Android APK** — Native app via Capacitor
- **PWA** — Installable on any device

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Framer Motion, React Router v6 |
| Native | Capacitor 6 (Android APK) |
| Audio | Agora RTC SDK |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Push | Firebase Cloud Messaging (FCM) |
| Email | Nodemailer (Gmail SMTP) |

---

## Project Structure

```
Al-Falah/
├── frontend/       ← React app + Capacitor Android
└── backend/        ← Express API + MongoDB
```

---

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # fill in your values
npm run dev            # http://localhost:5173
```

### Android APK
```bash
cd frontend
npm run apk:debug      # builds + installs via USB if connected
```

---

## Environment Variables

### Backend `.env`
```
MONGODB_URI=
JWT_SECRET=
AGORA_APP_ID=
FIREBASE_PROJECT_ID=
GMAIL_USER=
GMAIL_PASS=
PORT=3000
NODE_ENV=production
```

### Frontend `.env`
```
VITE_API_URL=https://your-backend-url.com
VITE_AGORA_APP_ID=
```

---

## Deployment

| Service | Platform |
|---------|----------|
| Backend | Railway / Render |
| Frontend | Vercel / Netlify |
| Database | MongoDB Atlas |
| Push | Firebase |

---

## Admin Access

Navigate to `/admin/login`. First-time setup is handled via `/admin/setup`.
