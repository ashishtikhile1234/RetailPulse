require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { requireAuth } = require('./middleware/auth.middleware');
const { requireRole } = require('./middleware/role.middleware');
const { error } = require('./utils/apiResponse.util');

// Route modules
const authRoutes  = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const storeRoutes = require('./routes/store.routes');
const ratingRoutes= require('./routes/rating.routes');
const ownerRoutes = require('./routes/owner.routes');
const userRoutes  = require('./routes/user.routes');

const app = express();

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'RetailPulse API is running 🚀', env: process.env.NODE_ENV });
});

// ── Routes ────────────────────────────────────────────────────────────────────
// Public
app.use('/api/auth', authRoutes);

// Admin only
app.use('/api/admin', requireAuth, requireRole('admin'), adminRoutes);

// All authenticated users (store listings with user's ratings)
app.use('/api/stores', requireAuth, storeRoutes);

// Normal users only (submit/update ratings)
app.use('/api/ratings', requireAuth, requireRole('user'), ratingRoutes);

// Store owners only
app.use('/api/owner', requireAuth, requireRole('store_owner'), ownerRoutes);

// All authenticated (change password)
app.use('/api/users', requireAuth, userRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  error(res, `Route ${req.method} ${req.path} not found.`, 404);
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  error(res, err.message || 'Internal server error.', err.status || 500);
});

module.exports = app;
