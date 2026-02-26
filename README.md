# 🎮 Steam Tracker
Track. Analyze. Optimize your Steam library.

A full-stack web application for tracking your Steam game library with journal, analytics, smart recommendations, and wishlist management.

> ⚠️ This project is not affiliated with Valve Corporation or Steam.

---

## Features

### Library Management

- Steam OAuth Integration – Automatic library sync
- Journal View – Card-based layout with game artwork
- Dashboard View – Sortable table with detailed stats
- Price Tracking – Calculate value per hour played
- Custom Tags – Organize games your way
- Tier Rating System – S/A/B/C/D tiers
- Achievement Tracking – Progress bars + 100% badges
- Personal Reviews 

---

### Smart Features

- Advanced Sorting – Name, playtime, price, rating, status
- Status Filters – Playing, Completed, Backlog, Unplayed
- Inline Editing – Edit prices and tags directly
- Real-Time Sync – Keep your library updated

---

### Wishlist Management

- Manual Game Entry
- Discount Tracking
- Tag Organization
- Price Comparison (Current vs List)

---

### Smart Recommendations

- Budget Optimizer
- 0/1 Knapsack Algorithm
- Smart Scoring System based on:
  - Discount %
  - Estimated playtime
  - Genre/tag matching
  - User ratings

---

## Screenshots

### Dashboard

![Dashboard](./screenshots/dashboard.png)

---

### Wishlist

![Wishlist](./screenshots/wishlist.png)

---

### Recommendations

![Recommendations](./screenshots/recommendations.png)

---

## Tech Stack

### Frontend

- React 18 + TypeScript
- Vite
- TailwindCSS
- Axios

### Backend

- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM
- Passport.js (Steam OAuth)
- Steam Web API

---

# Installation

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn
- Steam API Key

---

## 1. Clone the Repository
```bash
git clone https://github.com/Vishrut2403/Steam-Tracker.git
cd Steam-Tracker
```

## 2. Database Setup
```
psql -U postgres
CREATE DATABASE steam_tracker;
\q
```

## 3. Backend Setup

```
cd backend
npm install
cp .env.example .env
```
edit backend/ .env:
```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/steam_tracker"
STEAM_API_KEY="your_steam_api_key_here"
SESSION_SECRET="your_random_secure_string"
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:3001"
PORT=3001
```
Run Prisma Migrations

```
npx prisma migrate dev
npx prisma generate
```

Start Backend
```
npm run dev
```
---

## 4. Frontend Setup

```
cd ../frontend
npm install
cp .env.example .env
```
Edit frontend/ .env:
```
VITE_API_URL="http://localhost:3001"
```
Start the frontend
```
npm run dev
```
---

## 5. Usage

1. Open http://localhost:5173 
2. Click **Sign in with Steam** 
3. Authorize the application 
4. Wait for your library to sync 
5. Explore Journal, Dashboard, Wishlist & Recommendations 

---

## Author

Vishrut  Sachan
GitHub: https://github.com/Vishrut2403

---

## License

MIT License

