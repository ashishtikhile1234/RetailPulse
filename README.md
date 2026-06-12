# RetailPulse 🛍️

> A full-stack store rating platform — **Express.js + PostgreSQL + React.js**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.18-blue)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791)](https://postgresql.org)

---

## 📋 Overview

RetailPulse allows users to discover stores and submit 1–5 star ratings. The platform supports three distinct roles:

| Role | Access |
|------|--------|
| **Admin** | Dashboard stats, manage all users & stores |
| **Normal User** | Browse stores, submit & modify ratings |
| **Store Owner** | View own store's ratings and reviewer list |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Express.js 4.18, Node.js 18+ |
| Database | PostgreSQL 14+, Sequelize ORM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | express-validator |
| Frontend | React 18 (Vite), React Router v6 |
| HTTP Client | Axios |
| UI | Custom CSS (Inter font, Indigo/Amber palette) |
| Notifications | react-hot-toast |
| Icons | lucide-react |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- PostgreSQL 14+ running locally

### 1. Clone & Setup

```bash
git clone https://github.com/ashishtikhile1234/RetailPulse.git
cd RetailPulse
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET
npm install
npm run seed      # Creates default admin user
npm run dev       # Starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd client
cp .env.example .env
npm install
npm run dev       # Starts on http://localhost:5173
```

---

## 🔐 Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@retailpulse.com` |
| Password | `Admin@123` |

> ⚠️ Change this password after first login!

---

## 📡 API Endpoints

```
POST   /api/auth/register          Public — Normal user signup
POST   /api/auth/login             Public — All roles
GET    /api/auth/me                Protected

GET    /api/admin/stats            Admin — Dashboard counts
GET    /api/admin/users            Admin — List users (filter/sort/page)
GET    /api/admin/users/:id        Admin — User detail
POST   /api/admin/users            Admin — Create user
GET    /api/admin/stores           Admin — List stores with ratings
POST   /api/admin/stores           Admin — Create store

GET    /api/stores                 Auth — Stores with avg + user rating
POST   /api/ratings                User — Submit rating (1-5)
PUT    /api/ratings/:id            User — Update own rating

GET    /api/owner/dashboard        StoreOwner — Avg rating + raters list
PUT    /api/users/me/password      All roles — Change password
```

---

## ✅ Form Validation Rules

| Field | Rule |
|-------|------|
| Name | Min 20 chars, Max 60 chars |
| Email | Valid email format |
| Address | Max 400 chars |
| Password | 8–16 chars, ≥1 uppercase, ≥1 special char (`!@#$%^&*`) |
| Rating | Integer 1–5 |

---

## 📁 Project Structure

```
RetailPulse/
├── server/                 Express.js API
│   ├── config/             Database connection
│   ├── controllers/        Business logic
│   ├── middleware/         Auth + role guards
│   ├── models/             Sequelize models + associations
│   ├── routes/             Express routers
│   ├── seeders/            Default admin seed
│   ├── utils/              JWT, bcrypt, response helpers
│   ├── validators/         express-validator rule chains
│   ├── app.js              Express app setup
│   └── server.js           Entry point
└── client/                 React + Vite SPA
    └── src/
        ├── api/            Axios instance
        ├── context/        AuthContext
        ├── components/     Layout, ProtectedRoute
        └── pages/          auth/, admin/, user/, owner/
```

---

## 🗄️ Database Schema

```
users       (id, name, email, password, address, role)
stores      (id, name, email, address, owner_id → users.id)
ratings     (id, user_id → users, store_id → stores, value 1-5)
            UNIQUE(user_id, store_id)
```
