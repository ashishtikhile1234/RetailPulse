# RetailPulse

A full-stack store rating platform built with Express.js, PostgreSQL, and React.js. Users can discover stores and submit star ratings. The application supports three distinct roles — System Administrator, Normal User, and Store Owner — each with a dedicated dashboard and permissions model.

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://retail-pulse-three.vercel.app |
| Backend API (Render) | https://retailpulse-api-2rk7.onrender.com/api/health |

> The backend is hosted on Render's free tier. The first request after a period of inactivity may take 30–60 seconds to cold-start.

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| System Administrator | admin@retailpulse.com | Admin@123 |
| Normal User | Register via /register | — |
| Store Owner | Created by admin only | — |

---

## Features

### System Administrator
- Dashboard with real-time counts of total users, stores, and ratings
- User management — create users of any role, view user details, filter and sort by name, email, address, or role
- Store management — create stores, assign store owners, view average ratings
- Full sortable and searchable data tables with pagination

### Normal User
- Browse all registered stores with average ratings and personal rating status
- Submit a 1–5 star rating for any store (one rating per store enforced at the database level)
- Edit a previously submitted rating
- Change account password

### Store Owner
- View own store's average rating
- View the full list of users who have submitted ratings — with name, email, rating value, and submission date
- Change account password

---

## Tech Stack

### Backend

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Node.js | >= 18.x |
| Framework | Express.js | ^4.18 |
| ORM | Sequelize | ^6.x |
| Database | PostgreSQL | >= 14 |
| Authentication | JSON Web Tokens (jsonwebtoken) | ^9.x |
| Password Hashing | bcryptjs | ^2.x |
| Validation | express-validator | ^7.x |
| Logging | morgan | ^1.x |
| Environment | dotenv | ^16.x |
| CORS | cors | ^2.x |

### Frontend

| Layer | Technology |
|-------|------------|
| Framework | React 19 (Vite) |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Icons | lucide-react |
| Styling | Custom CSS with CSS Variables |

### Infrastructure

| Service | Provider |
|---------|----------|
| Database | Neon (serverless PostgreSQL) |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |

---

## Getting Started (Local Development)

### Prerequisites

- Node.js >= 18
- PostgreSQL 14+ running locally (or a Neon/Supabase connection string)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/ashishtikhile1234/RetailPulse.git
cd RetailPulse
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/retailpulse
JWT_SECRET=your_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

```bash
npm install
npm run seed      # Seeds the default admin user
npm run dev       # API server starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../client
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
npm install
npm run dev       # React app starts on http://localhost:5173
```

---

## API Reference

### Base URL

```
http://localhost:5000/api
```

### Authentication Header

```
Authorization: Bearer <jwt_token>
```

### Endpoints

```
AUTH
  POST   /api/auth/register          Public — Normal user self-registration
  POST   /api/auth/login             Public — All roles, returns JWT + role
  GET    /api/auth/me                Protected — Returns current user

ADMIN — Requires role: admin
  GET    /api/admin/stats            Platform statistics (users, stores, ratings)
  GET    /api/admin/users            List users with filter, sort, pagination
  GET    /api/admin/users/:id        User detail (store owners include avg rating)
  POST   /api/admin/users            Create user of any role
  GET    /api/admin/stores           List stores with average ratings
  POST   /api/admin/stores           Create store with optional owner assignment

STORES — Requires authentication
  GET    /api/stores                 All stores with avg rating and user's own rating

RATINGS — Requires role: user
  POST   /api/ratings                Submit a rating (body: store_id, value 1-5)
  PUT    /api/ratings/:id            Update own rating (body: value)

OWNER — Requires role: store_owner
  GET    /api/owner/dashboard        Own store avg rating and full raters list

USER ACCOUNT — All authenticated roles
  PUT    /api/users/me/password      Change own password
```

### Standard Response Envelope

```json
// Success
{ "success": true, "data": {}, "message": "Operation successful" }

// Error
{ "success": false, "error": "Error message", "details": [] }
```

### Query Parameters (List Endpoints)

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Filter by name, email, or address |
| role | string | Filter by role (admin endpoints) |
| sortBy | string | Column to sort by |
| sortOrder | asc / desc | Sort direction |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 10) |

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Name | Min 20 chars, Max 60 chars | Name must be between 20 and 60 characters. |
| Email | Valid RFC 5322 email | Please enter a valid email address. |
| Address | Max 400 chars | Address must not exceed 400 characters. |
| Password | 8-16 chars, at least 1 uppercase, at least 1 special character (!@#$%^&*) | Password must be 8-16 characters, include at least one uppercase letter and one special character. |
| Rating | Integer 1-5 | Rating must be a whole number between 1 and 5. |

Validation is enforced at three levels: React Hook Form on the frontend, express-validator on every API route, and PostgreSQL CHECK constraints as the final safety net.

---

## Database Schema

```
users
  id          SERIAL PRIMARY KEY
  name        VARCHAR(60)   NOT NULL
  email       VARCHAR(255)  NOT NULL UNIQUE
  password    VARCHAR(255)  NOT NULL          -- bcrypt hash, never returned in responses
  address     VARCHAR(400)
  role        VARCHAR(20)   NOT NULL DEFAULT 'user'   -- 'admin' | 'user' | 'store_owner'
  created_at  TIMESTAMP
  updated_at  TIMESTAMP

stores
  id          SERIAL PRIMARY KEY
  name        VARCHAR(60)   NOT NULL
  email       VARCHAR(255)  NOT NULL UNIQUE
  address     VARCHAR(400)  NOT NULL
  owner_id    INTEGER       REFERENCES users(id) ON DELETE SET NULL
  created_at  TIMESTAMP
  updated_at  TIMESTAMP

ratings
  id          SERIAL PRIMARY KEY
  user_id     INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE
  store_id    INTEGER       NOT NULL REFERENCES stores(id) ON DELETE CASCADE
  value       SMALLINT      NOT NULL CHECK (value >= 1 AND value <= 5)
  created_at  TIMESTAMP
  updated_at  TIMESTAMP
  UNIQUE (user_id, store_id)
```

---

## Role and Permission Matrix

| Feature | Admin | Normal User | Store Owner |
|---------|:-----:|:-----------:|:-----------:|
| Login | Yes | Yes | Yes |
| Self-registration | No | Yes | No |
| Update own password | Yes | Yes | Yes |
| View platform stats dashboard | Yes | No | No |
| Create users and stores | Yes | No | No |
| View all users list | Yes | No | No |
| View all stores list | Yes | Yes | No |
| Search and filter stores | Yes | Yes | No |
| Submit store rating | No | Yes | No |
| Modify own rating | No | Yes | No |
| View own store's ratings | No | No | Yes |

---

## Project Structure

```
RetailPulse/
├── server/
│   ├── config/
│   │   └── database.js          Sequelize connection setup
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── admin.controller.js
│   │   ├── store.controller.js
│   │   ├── rating.controller.js
│   │   ├── owner.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js    JWT verification (requireAuth)
│   │   └── role.middleware.js    Role-based access control (requireRole)
│   ├── models/
│   │   ├── index.js             Sequelize associations
│   │   ├── user.model.js
│   │   ├── store.model.js
│   │   └── rating.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── admin.routes.js
│   │   ├── store.routes.js
│   │   ├── rating.routes.js
│   │   ├── owner.routes.js
│   │   └── user.routes.js
│   ├── seeders/
│   │   └── admin.seed.js        Default admin user
│   ├── utils/
│   │   ├── jwt.util.js
│   │   ├── hash.util.js
│   │   └── apiResponse.util.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── user.validator.js
│   │   ├── store.validator.js
│   │   └── rating.validator.js
│   ├── app.js                   Express app, middleware, and route wiring
│   ├── server.js                HTTP server entry point
│   └── render.yaml              Render deployment configuration
└── client/
    └── src/
        ├── api/
        │   └── axios.js         Axios instance with Authorization interceptor
        ├── context/
        │   └── AuthContext.jsx  Global auth state, login(), logout()
        ├── components/
        │   └── layout/
        │       ├── AppLayout.jsx
        │       ├── Sidebar.jsx
        │       └── ProtectedRoute.jsx
        └── pages/
            ├── auth/            LoginPage, RegisterPage
            ├── admin/           AdminDashboard, UserListPage, UserDetailPage,
            │                    AddUserPage, StoreListPage, AddStorePage
            ├── user/            StoreListPage, ChangePasswordPage
            └── owner/           OwnerDashboard
```

---

## Security

- Passwords are hashed with bcryptjs at 12 salt rounds and are never returned in any API response.
- All non-public routes are protected by the `requireAuth` middleware which verifies the JWT signature.
- Role enforcement is applied server-side on every protected route — there is no client-side-only access control.
- Sequelize parameterized queries prevent SQL injection.
- Express payload size is limited to 10 KB to prevent large payload attacks.
- CORS is configured to only allow requests from the known frontend origin.
- The `.env` file is excluded from version control via `.gitignore`.

---

## Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/retailpulse
JWT_SECRET=your_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## License

This project was built as a full-stack intern coding challenge. All rights reserved.
