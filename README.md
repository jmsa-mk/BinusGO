# BinusGO! — Transit Cerdas Menuju Kampus

Full-stack MERN web app: smart transit planner untuk kampus BINUS di Jabodetabek.
Aggregates TransJakarta, KRL, LRT Jabodebek, dan Mikrotrans.

## Stack
- **Frontend**: React (Vite) + Tailwind CSS + React Router v6 + Leaflet/React-Leaflet + Recharts + Lucide
- **Backend**: Node.js + Express + MongoDB (Mongoose) + JWT + bcrypt

## Struktur
```
BinusGO/
├── client/   # React (Vite)
└── server/   # Express + MongoDB
```

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env       # isi MONGO_URI & JWT_SECRET
npm run seed               # seed kampus + rute
npm run dev                # port 5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev                # port 5173
```

Buka http://localhost:5173

## Akun Admin Default (setelah seed)
- Email: `admin@binus.edu`
- Password: `admin123`

## Akun User Demo
- Email: `student@binus.ac.id`
- Password: `student123`

## Scope MVP yang sudah jadi
- ✅ Landing page (hero, stats, mode cards, CTA)
- ✅ Auth: register, login, JWT (httpOnly cookie + Bearer)
- ✅ Route Planner + Leaflet map (campus markers, route polyline, stop markers, mode colors)
- ✅ Saved Locations (auth-gated)
- ✅ Trip History (auth-gated, auto-record search)
- ✅ Admin Dashboard (stats + Recharts)
- ✅ Sidebar nav, mobile responsive, color tokens sesuai spec

## TODO (post-MVP)
- Admin CRUD lengkap (Kampus, Rute, Pengguna, Reports, Activity Log)
- OAuth Google/Microsoft
- Real routing API integration
