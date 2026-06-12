const { validationResult } = require('express-validator');
const { User } = require('../models');
const { hashPassword, comparePassword } = require('../utils/hash.util');
const { signToken } = require('../utils/jwt.util');
const { success, error } = require('../utils/apiResponse.util');

// ── Register ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 'Validation failed.', 422, errors.array());
  }

  try {
    const { name, email, password, address } = req.body;

    const existing = await User.unscoped().findOne({ where: { email } });
    if (existing) {
      return error(res, 'An account with this email already exists.', 409);
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role: 'user', // self-registration always creates normal users
    });

    const token = signToken({ id: user.id, role: user.role });

    return success(
      res,
      { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, address: user.address } },
      'Registration successful. Welcome to RetailPulse!',
      201
    );
  } catch (err) {
    console.error('Register error:', err);
    return error(res, 'Registration failed. Please try again.', 500);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 'Validation failed.', 422, errors.array());
  }

  try {
    const { email, password } = req.body;

    // Fetch user WITH password (bypass defaultScope)
    const user = await User.unscoped().findOne({ where: { email } });
    if (!user) {
      return error(res, 'Invalid email or password.', 401);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return error(res, 'Invalid email or password.', 401);
    }

    const token = signToken({ id: user.id, role: user.role });

    return success(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
      },
    }, 'Login successful.');
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Login failed. Please try again.', 500);
  }
};

// ── Me ────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  return success(res, req.user, 'User profile fetched.');
};

module.exports = { register, login, getMe };
