# 📦 RetailPulse — Product Requirements Document (PRD)

> **Version:** 1.0.0  
> **Date:** June 2026  
> **Type:** Full-Stack Intern Coding Challenge  
> **Status:** 🟢 Active

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Functional Requirements](#6-functional-requirements)
7. [API Design](#7-api-design)
8. [Form Validations](#8-form-validations)
9. [UI/UX Requirements](#9-uiux-requirements)
10. [Security Requirements](#10-security-requirements)
11. [Implementation Phases](#11-implementation-phases)
12. [Folder Structure](#12-folder-structure)

---

## 1. Project Overview

**RetailPulse** is a web application that allows registered users to discover stores and submit ratings (1–5 stars). The platform supports three distinct user roles — System Administrator, Normal User, and Store Owner — each with tailored access to features and dashboards.

### 🎯 Core Goals

| Goal | Description |
|------|-------------|
| **Multi-Role Auth** | Single unified login system with role-based access control (RBAC) |
| **Store Ratings** | Users can submit and modify 1–5 star ratings for registered stores |
| **Admin Control** | Admins can manage users and stores from a central dashboard |
| **Store Analytics** | Store owners can monitor ratings and reviewer activity |
| **Responsive UI** | A modern, clean React.js SPA that works across all devices |

---

## 2. Tech Stack

### Backend
| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Node.js | ≥ 18.x |
| Framework | **Express.js** | ^4.18 |
| ORM | Sequelize | ^6.x |
| Auth | JSON Web Tokens (JWT) | ^9.x |
| Password Hashing | bcryptjs | ^2.x |
| Validation | express-validator | ^7.x |
| Environment Config | dotenv | ^16.x |
| CORS | cors | ^2.x |
| Logger | morgan | ^1.x |

### Database
| Layer | Technology |
|-------|------------|
| Primary DB | **PostgreSQL** ≥ 14 |
| ORM Dialect | sequelize-postgres (pg + pg-hstore) |

### Frontend
| Layer | Technology |
|-------|------------|
| Framework | **React.js** (Vite) |
| Routing | React Router v6 |
| State Management | React Context API + useReducer |
| HTTP Client | Axios |
| UI Components | Custom CSS + CSS Modules |
| Form Management | React Hook Form |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Table | TanStack Table v8 |

### DevOps & Tooling
| Tool | Purpose |
|------|---------|
| ESLint + Prettier | Code quality & formatting |
| Nodemon | Dev hot-reload for backend |
| Vite | Frontend bundler & dev server |
| dotenv | Environment variable management |
| Git | Version control |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                    React.js SPA  :5173                       │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP / JSON (REST API)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS API SERVER                      │
│                         :5000                                │
│                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │  Auth    │  │  Users   │  │  Stores  │  │ Ratings  │  │
│   │  Router  │  │  Router  │  │  Router  │  │  Router  │  │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│        │              │              │              │        │
│   ┌────▼──────────────▼──────────────▼──────────────▼────┐  │
│   │              Middleware Layer                         │  │
│   │   (JWT Auth Guard | Role Check | Input Validation)   │  │
│   └────────────────────────┬──────────────────────────────┘  │
│                            │                                │
│   ┌────────────────────────▼──────────────────────────────┐  │
│   │               Sequelize ORM Layer                     │  │
│   └────────────────────────┬──────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│              users | stores | ratings                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema

### 4.1 `users` Table

```sql
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(60)   NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,             -- bcrypt hash
  address     VARCHAR(400),
  role        VARCHAR(20)   NOT NULL DEFAULT 'user',
                                                  -- 'admin' | 'user' | 'store_owner'
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);
```

### 4.2 `stores` Table

```sql
CREATE TABLE stores (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(60)   NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  address     VARCHAR(400)  NOT NULL,
  owner_id    INTEGER       REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);
```

> **Note:** `owner_id` references a user with `role = 'store_owner'`. A store owner is created through the admin panel.

### 4.3 `ratings` Table

```sql
CREATE TABLE ratings (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id    INTEGER       NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  value       SMALLINT      NOT NULL CHECK (value >= 1 AND value <= 5),
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, store_id)                      -- one rating per user per store
);
```

### 4.4 Entity Relationship Diagram

```
users ─────────────────── ratings ─────────────── stores
  | id                       | user_id (FK)          | id
  | name                     | store_id (FK)         | name
  | email                    | value (1-5)           | email
  | password                 | created_at            | address
  | address                  └───────────────────────| owner_id (FK → users.id)
  | role                                             └─────────
  └─────────────────────────────────────────────────────────────
       [owner_id in stores references users.id where role='store_owner']
```

### 4.5 Virtual/Computed Fields

| Field | Computed From | Exposed Via |
|-------|--------------|-------------|
| `average_rating` | `AVG(ratings.value)` GROUP BY `store_id` | API query join |
| `user_rating` | `ratings.value` WHERE `user_id = currentUser` | API query join |
| `total_ratings` | `COUNT(ratings.id)` GROUP BY `store_id` | API query join |

---

## 5. User Roles & Permissions

### Role Matrix

| Feature | Admin | Normal User | Store Owner |
|---------|:-----:|:-----------:|:-----------:|
| Login | ✅ | ✅ | ✅ |
| Self-registration / Signup | ❌ | ✅ | ❌ |
| Update own password | ✅ | ✅ | ✅ |
| View dashboard stats | ✅ | ❌ | ✅ (own store) |
| Add users (admin/user) | ✅ | ❌ | ❌ |
| Add stores | ✅ | ❌ | ❌ |
| View all users list | ✅ | ❌ | ❌ |
| View all stores list | ✅ | ✅ | ❌ |
| Filter/search stores | ✅ | ✅ | ❌ |
| View user details | ✅ | ❌ | ❌ |
| Submit rating | ❌ | ✅ | ❌ |
| Modify own rating | ❌ | ✅ | ❌ |
| View ratings for own store | ❌ | ❌ | ✅ |
| Logout | ✅ | ✅ | ✅ |

---

## 6. Functional Requirements

### 6.1 Authentication Module

#### `POST /api/auth/register`
- Public endpoint (Normal Users only)
- Fields: `name`, `email`, `address`, `password`
- Validates all form fields per validation rules
- On success: creates user with `role = 'user'`
- Returns JWT token + user object (without password)

#### `POST /api/auth/login`
- Public endpoint — all roles use same login page
- Fields: `email`, `password`
- Returns JWT token + user object with `role`
- Frontend redirects to role-specific dashboard on success

#### `GET /api/auth/me`
- Protected — requires valid JWT
- Returns current authenticated user profile

---

### 6.2 System Administrator

#### Dashboard (`GET /api/admin/stats`)
Returns:
```json
{
  "totalUsers": 150,
  "totalStores": 42,
  "totalRatings": 873
}
```

#### User Management

| Action | Endpoint | Details |
|--------|----------|---------|
| List users | `GET /api/admin/users` | Supports filters: name, email, address, role. Supports sort. |
| View user detail | `GET /api/admin/users/:id` | Returns name, email, address, role. If `store_owner`, also returns avg rating. |
| Add user | `POST /api/admin/users` | Fields: name, email, password, address, role |

#### Store Management

| Action | Endpoint | Details |
|--------|----------|---------|
| List stores | `GET /api/admin/stores` | Columns: name, email, address, avg_rating. Supports filters + sort. |
| Add store | `POST /api/admin/stores` | Fields: name, email, address, owner_id (optional) |

---

### 6.3 Normal User

#### Store Discovery

| Action | Endpoint | Details |
|--------|----------|---------|
| List all stores | `GET /api/stores` | Includes: store name, address, avg rating, user's own rating (if submitted). Supports search by name/address. |
| Submit rating | `POST /api/ratings` | Body: `{ store_id, value }` — value must be 1–5. |
| Modify rating | `PUT /api/ratings/:id` | Body: `{ value }` — only the rating author can update. |

#### Account Management

| Action | Endpoint | Details |
|--------|----------|---------|
| Update password | `PUT /api/users/me/password` | Body: `{ currentPassword, newPassword }` |

---

### 6.4 Store Owner

#### Dashboard

| Action | Endpoint | Details |
|--------|----------|---------|
| View store dashboard | `GET /api/owner/dashboard` | Returns avg rating + list of users who rated their store (name, email, rating value, submitted date) |
| Update password | `PUT /api/users/me/password` | Same as normal user |

---

## 7. API Design

### Base URL
```
http://localhost:5000/api
```

### Authentication Header
```
Authorization: Bearer <jwt_token>
```

### Full Endpoint Inventory

```
AUTH
  POST   /api/auth/register          → Register new normal user
  POST   /api/auth/login             → Login (all roles)
  GET    /api/auth/me                → Get current user [Protected]

USERS (Admin only)
  GET    /api/admin/users            → List users [Admin]
  GET    /api/admin/users/:id        → Get user detail [Admin]
  POST   /api/admin/users            → Create user [Admin]

STORES (Admin only — write)
  GET    /api/admin/stores           → List all stores [Admin]
  POST   /api/admin/stores           → Create store [Admin]

STORES (All authenticated — read)
  GET    /api/stores                 → List stores with avg rating + user rating [Auth]

RATINGS
  POST   /api/ratings                → Submit rating [Normal User]
  PUT    /api/ratings/:id            → Update rating [Normal User, owner only]

OWNER
  GET    /api/owner/dashboard        → Store owner dashboard [Store Owner]

USER ACCOUNT
  PUT    /api/users/me/password      → Update own password [All roles]

ADMIN STATS
  GET    /api/admin/stats            → Platform statistics [Admin]
```

### Standard Response Format

```json
// Success
{
  "success": true,
  "data": { },
  "message": "Operation successful"
}

// Error
{
  "success": false,
  "error": "Error message",
  "details": [ ]
}
```

### Query Parameters for List Endpoints

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name / email / address |
| `role` | string | Filter by role (admin endpoints) |
| `sortBy` | string | Field to sort by (e.g., `name`, `email`) |
| `sortOrder` | `asc` or `desc` | Sort direction |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |

---

## 8. Form Validations

### Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| **Name** | Min 20 chars, Max 60 chars | "Name must be between 20 and 60 characters." |
| **Email** | Valid email format (RFC 5322) | "Please enter a valid email address." |
| **Address** | Max 400 chars | "Address must not exceed 400 characters." |
| **Password** | 8–16 chars, at least 1 uppercase, at least 1 special char `(!@#$%^&*)` | "Password must be 8–16 characters, include at least one uppercase letter and one special character." |
| **Rating** | Integer between 1–5 (inclusive) | "Rating must be a whole number between 1 and 5." |

### Validation Implementation

- **Backend:** `express-validator` middleware on every route that accepts input
- **Frontend:** `react-hook-form` with inline error messages
- **DB Level:** PostgreSQL `CHECK` constraints as final safety net

### Password Regex
```regex
^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$
```

---

## 9. UI/UX Requirements

### 9.1 Pages & Routes

```
PUBLIC ROUTES
  /login                  → Unified login page (all roles)
  /register               → Normal user signup page

PROTECTED ROUTES (redirect to /login if not authenticated)
  /admin/dashboard        → Admin stats dashboard [Admin]
  /admin/users            → User management table [Admin]
  /admin/users/:id        → User detail view [Admin]
  /admin/users/new        → Add user form [Admin]
  /admin/stores           → Store management table [Admin]
  /admin/stores/new       → Add store form [Admin]

  /stores                 → Browse stores [Normal User]
  /account/password       → Change password [Normal User, Store Owner]

  /owner/dashboard        → Store owner dashboard [Store Owner]
```

### 9.2 Component Hierarchy

```
App
├── AuthProvider (Context)
├── Router
│   ├── PublicRoute (redirects to dashboard if already logged in)
│   │   ├── LoginPage
│   │   └── RegisterPage
│   └── ProtectedRoute (checks role)
│       ├── AdminLayout
│       │   ├── AdminDashboard
│       │   ├── UserListPage    (with filters + sort)
│       │   ├── UserDetailPage
│       │   ├── AddUserPage
│       │   ├── StoreListPage   (with filters + sort)
│       │   └── AddStorePage
│       ├── NormalUserLayout
│       │   ├── StoreListPage   (search + rating UI)
│       │   └── ChangePasswordPage
│       └── StoreOwnerLayout
│           ├── OwnerDashboard  (avg rating + rater list)
│           └── ChangePasswordPage
```

### 9.3 Table Requirements

All table components must support:
- ✅ **Column sorting** (asc/desc) on: Name, Email, Address, Role, Rating
- ✅ **Search/filter** inputs (debounced, 300ms)
- ✅ **Pagination** with page size selector (10 / 25 / 50)
- ✅ **Loading skeleton** state while fetching
- ✅ **Empty state** illustration when no results

### 9.4 Store Listing Card (Normal User)

Each store card must show:
```
┌─────────────────────────────────────────────────┐
│  🏪 Store Name                                  │
│  📍 Address                                      │
│  ⭐ Overall Rating: 4.2 (23 ratings)            │
│  👤 Your Rating: ★★★★☆ (4)                      │
│  [Rate This Store]  or  [Edit Rating]           │
└─────────────────────────────────────────────────┘
```

- Rating input: Star-click UI (1–5 stars, visually rendered)
- If user has already rated → show "Edit Rating" instead of "Rate"
- Rating submission shows success toast notification

### 9.5 Design System

| Token | Value |
|-------|-------|
| Primary Color | `#6366F1` (Indigo) |
| Secondary Color | `#F59E0B` (Amber — for stars) |
| Danger | `#EF4444` |
| Success | `#22C55E` |
| Background | `#F8FAFC` |
| Surface | `#FFFFFF` |
| Font | Inter (Google Fonts) |
| Border Radius | `8px` (cards), `6px` (inputs) |
| Shadow | `0 1px 3px rgba(0,0,0,0.1)` |

---

## 10. Security Requirements

### 10.1 Authentication & Authorization

| Requirement | Implementation |
|-------------|----------------|
| JWT-based stateless auth | Sign with `process.env.JWT_SECRET`, expire in `7d` |
| Password hashing | `bcryptjs` with salt rounds = 12 |
| Role-based middleware | `requireAuth` + `requireRole('admin')` middleware chain |
| Token storage | `localStorage` (client-side); never store raw password |

### 10.2 Input Security

| Threat | Mitigation |
|--------|------------|
| SQL Injection | Sequelize parameterized queries (never raw string interpolation) |
| XSS | `express-validator` sanitizers + React's default escaping |
| CSRF | Stateless JWT means CSRF is not applicable for APIs |
| Mass Assignment | Whitelist only expected fields in each controller |

### 10.3 API Security

- All non-public endpoints protected by `requireAuth` middleware
- Role checks applied per route — no client-side-only role gating
- Passwords **never** returned in any API response
- `.env` file never committed to version control (`.gitignore`)
- `cors` configured to only allow the frontend origin in production

### 10.4 Middleware Stack (Express)

```javascript
// app.js middleware order
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json({ limit: '10kb' }))  // prevent large payloads
app.use(morgan('dev'))
app.use('/api/auth',   authRouter)
app.use('/api/admin',  requireAuth, requireRole('admin'), adminRouter)
app.use('/api/stores', requireAuth, storeRouter)
app.use('/api/ratings',requireAuth, requireRole('user'), ratingRouter)
app.use('/api/owner',  requireAuth, requireRole('store_owner'), ownerRouter)
app.use('/api/users',  requireAuth, userRouter)
app.use(globalErrorHandler)
```

---

## 11. Implementation Phases

### Phase 1 — Project Setup & Database *(Day 1)*
- [ ] Initialize Express.js project with folder structure
- [ ] Configure PostgreSQL + Sequelize connection
- [ ] Write Sequelize models: `User`, `Store`, `Rating`
- [ ] Run migrations to create tables with constraints
- [ ] Seed: 1 default admin user
- [ ] Initialize React + Vite frontend project
- [ ] Configure Axios, React Router, AuthContext

### Phase 2 — Auth System *(Day 1–2)*
- [ ] `POST /api/auth/register` — Normal user signup with validation
- [ ] `POST /api/auth/login` — Unified login, return JWT + role
- [ ] `GET /api/auth/me` — Token verification endpoint
- [ ] Frontend: Login page (form + validation + redirect by role)
- [ ] Frontend: Register page
- [ ] Frontend: AuthContext with `login()`, `logout()`, `user` state
- [ ] Frontend: ProtectedRoute + role-guard wrapper components

### Phase 3 — Admin Features *(Day 2–3)*
- [ ] `GET /api/admin/stats` — Dashboard counts
- [ ] `GET /api/admin/users` — List with filter, sort, pagination
- [ ] `GET /api/admin/users/:id` — User detail (with store owner rating)
- [ ] `POST /api/admin/users` — Create any user type
- [ ] `GET /api/admin/stores` — List stores with avg rating
- [ ] `POST /api/admin/stores` — Create store
- [ ] Frontend: Admin dashboard with stat cards
- [ ] Frontend: User management table (sortable, filterable)
- [ ] Frontend: User detail page
- [ ] Frontend: Add user form
- [ ] Frontend: Store management table
- [ ] Frontend: Add store form

### Phase 4 — Normal User Features *(Day 3)*
- [ ] `GET /api/stores` — Stores with avg rating + user's rating
- [ ] `POST /api/ratings` — Submit rating
- [ ] `PUT /api/ratings/:id` — Modify own rating
- [ ] `PUT /api/users/me/password` — Change password
- [ ] Frontend: Store browse page with search
- [ ] Frontend: Star rating component (interactive)
- [ ] Frontend: Change password page

### Phase 5 — Store Owner Features *(Day 4)*
- [ ] `GET /api/owner/dashboard` — Avg rating + raters list
- [ ] Frontend: Store owner dashboard
- [ ] Frontend: Raters table with sort

### Phase 6 — Polish & QA *(Day 4–5)*
- [ ] Table sorting (asc/desc) for all list views
- [ ] Full form validation (frontend + backend)
- [ ] Loading states and error handling
- [ ] Toast notifications for all user actions
- [ ] Empty states for all tables
- [ ] Responsive design (mobile + desktop)
- [ ] Code review: remove console.logs, add comments
- [ ] Final end-to-end test of all 3 role flows

---

## 12. Folder Structure

### Backend (`/server`)

```
server/
├── config/
│   └── database.js          # Sequelize connection setup
├── middleware/
│   ├── auth.middleware.js    # requireAuth (JWT verify)
│   └── role.middleware.js    # requireRole('admin') etc.
├── models/
│   ├── index.js             # Sequelize associations
│   ├── user.model.js
│   ├── store.model.js
│   └── rating.model.js
├── controllers/
│   ├── auth.controller.js
│   ├── admin.controller.js
│   ├── store.controller.js
│   ├── rating.controller.js
│   ├── owner.controller.js
│   └── user.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── admin.routes.js
│   ├── store.routes.js
│   ├── rating.routes.js
│   ├── owner.routes.js
│   └── user.routes.js
├── validators/
│   ├── auth.validator.js    # express-validator rule chains
│   ├── user.validator.js
│   ├── store.validator.js
│   └── rating.validator.js
├── utils/
│   ├── jwt.util.js          # signToken, verifyToken helpers
│   ├── hash.util.js         # hashPassword, comparePassword
│   └── apiResponse.util.js  # success(), error() response helpers
├── seeders/
│   └── admin.seed.js        # Default admin user
├── .env
├── .env.example
├── app.js                   # Express app setup (middleware + routes)
└── server.js                # HTTP server entry point
```

### Frontend (`/client`)

```
client/
├── public/
├── src/
│   ├── api/
│   │   └── axios.js         # Axios instance with auth interceptor
│   ├── context/
│   │   └── AuthContext.jsx  # User state, login(), logout()
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── StarRating.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── Spinner.jsx
│   │   ├── tables/
│   │   │   ├── SortableTable.jsx
│   │   │   └── EmptyState.jsx
│   │   └── layout/
│   │       ├── Sidebar.jsx
│   │       ├── Navbar.jsx
│   │       └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── UserListPage.jsx
│   │   │   ├── UserDetailPage.jsx
│   │   │   ├── AddUserPage.jsx
│   │   │   ├── StoreListPage.jsx
│   │   │   └── AddStorePage.jsx
│   │   ├── user/
│   │   │   ├── StoreListPage.jsx
│   │   │   └── ChangePasswordPage.jsx
│   │   └── owner/
│   │       ├── OwnerDashboard.jsx
│   │       └── ChangePasswordPage.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useDebounce.js
│   ├── utils/
│   │   └── validation.js
│   ├── styles/
│   │   ├── index.css
│   │   └── components.css
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .env.example
└── vite.config.js
```

---

## Appendix A — Environment Variables

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/retailpulse
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Appendix B — Seed Data

| Role | Email | Password | Name |
|------|-------|----------|------|
| admin | admin@retailpulse.com | Admin@123 | RetailPulse Administrator |

> ⚠️ Change all seed credentials before any deployment.

---

## Appendix C — Key Business Rules

1. **One rating per user per store** — enforced by `UNIQUE(user_id, store_id)` in DB.
2. **Store owners cannot rate stores** — enforced by `requireRole('user')` on rating endpoints.
3. **Admins cannot rate stores** — same enforcement as above.
4. **Store owners are created only by admins** — no public signup for `store_owner` role.
5. **Admin users are created only by admins** — no public signup for `admin` role.
6. **Average rating is always computed live** from the `ratings` table — never cached/stored.
7. **Deleting a user cascades** to their ratings.
8. **Deleting a store cascades** to all its ratings.

---

*PRD maintained by the development team. Last updated: June 2026.*
