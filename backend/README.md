# Al-Falah Backend

Express + MongoDB REST API for the Al-Falah Masjid app.

---

## Setup

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev            # http://localhost:3000
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWT tokens (min 32 chars) |
| `AGORA_APP_ID` | Agora project App ID |
| `FIREBASE_PROJECT_ID` | Firebase project ID for FCM |
| `GMAIL_USER` | Gmail address for OTP emails |
| `GMAIL_PASS` | Gmail app password |
| `PORT` | Server port (default 3000) |
| `NODE_ENV` | `development` or `production` |

---

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
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
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/setup` | First-time password setup |
| PUT | `/api/auth/change-password` | Change password |
| POST | `/api/auth/forgot-password` | Send OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/reset-password` | Reset with OTP token |

### Admin (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/prayers` | Update prayer times |
| PUT | `/api/prayers/jumma` | Update Jumma times |
| PUT | `/api/weekly` | Update weekly schedule |
| PUT | `/api/ramadan` | Update Ramadan timetable |
| PUT | `/api/eid/:type` | Update Eid schedule |
| POST | `/api/announcements` | Create announcement |
| DELETE | `/api/announcements/:id` | Delete announcement |
| PUT | `/api/masjid` | Update masjid info |
| PUT | `/api/ticker` | Update ticker items |
| PUT | `/api/live-azan` | Update live azan settings |
| GET | `/api/live-azan/muazzin-token` | Get muazzin token |
| POST | `/api/live-azan/muazzin-token` | Generate new muazzin token |

### Muazzin (token in URL, no login)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/live-azan/muazzin/:token/verify` | Verify token |
| PUT | `/api/live-azan/muazzin/:token` | Toggle live status |

---

## Scripts

```bash
npm run dev       # development with nodemon
npm start         # production
npm run seed      # seed initial data to MongoDB
```
