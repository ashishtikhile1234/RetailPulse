const { validationResult } = require('express-validator');
const { Op, fn, col, literal } = require('sequelize');
const { User, Store, Rating } = require('../models');
const { hashPassword } = require('../utils/hash.util');
const { success, error } = require('../utils/apiResponse.util');

// ── Dashboard Stats ───────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.count({ where: { role: ['user', 'store_owner'] } }),
      Store.count(),
      Rating.count(),
    ]);
    return success(res, { totalUsers, totalStores, totalRatings }, 'Stats fetched.');
  } catch (err) {
    console.error('Stats error:', err);
    return error(res, 'Failed to fetch stats.', 500);
  }
};

// ── List Users ────────────────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { search, role, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10 } = req.query;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const allowedSort = ['name', 'email', 'address', 'role', 'created_at'];
    const order = [[allowedSort.includes(sortBy) ? sortBy : 'name', sortOrder === 'desc' ? 'DESC' : 'ASC']];

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await User.findAndCountAll({ where, order, limit: parseInt(limit), offset });

    return success(res, { users: rows, total: count, page: parseInt(page), limit: parseInt(limit) }, 'Users fetched.');
  } catch (err) {
    console.error('Get users error:', err);
    return error(res, 'Failed to fetch users.', 500);
  }
};

// ── Get User By ID ────────────────────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found.', 404);

    let responseData = user.toJSON();

    // If store_owner, include their store's average rating
    if (user.role === 'store_owner') {
      const store = await Store.findOne({ where: { owner_id: user.id } });
      if (store) {
        const avgResult = await Rating.findOne({
          attributes: [[fn('AVG', col('value')), 'avgRating'], [fn('COUNT', col('id')), 'totalRatings']],
          where: { store_id: store.id },
          raw: true,
        });
        responseData.store = {
          id: store.id,
          name: store.name,
          avgRating: avgResult?.avgRating ? parseFloat(parseFloat(avgResult.avgRating).toFixed(1)) : null,
          totalRatings: parseInt(avgResult?.totalRatings || 0),
        };
      }
    }

    return success(res, responseData, 'User details fetched.');
  } catch (err) {
    console.error('Get user error:', err);
    return error(res, 'Failed to fetch user.', 500);
  }
};

// ── Create User (Admin) ───────────────────────────────────────────────────────
const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return error(res, 'Validation failed.', 422, errors.array());

  try {
    const { name, email, password, address, role } = req.body;

    const existing = await User.unscoped().findOne({ where: { email } });
    if (existing) return error(res, 'An account with this email already exists.', 409);

    const hashedPassword = await hashPassword(password);
    const user = await User.create({ name, email, password: hashedPassword, address, role });

    return success(res, { id: user.id, name: user.name, email: user.email, role: user.role, address: user.address },
      'User created successfully.', 201);
  } catch (err) {
    console.error('Create user error:', err);
    return error(res, 'Failed to create user.', 500);
  }
};

// ── List Stores (Admin) ───────────────────────────────────────────────────────
const getAdminStores = async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10 } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const allowedSort = ['name', 'email', 'address', 'created_at'];
    const order = [[allowedSort.includes(sortBy) ? sortBy : 'name', sortOrder === 'desc' ? 'DESC' : 'ASC']];
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Store.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
    });

    // Attach average ratings
    const storeIds = rows.map((s) => s.id);
    const ratings = await Rating.findAll({
      attributes: ['store_id', [fn('AVG', col('value')), 'avgRating'], [fn('COUNT', col('id')), 'totalRatings']],
      where: { store_id: storeIds },
      group: ['store_id'],
      raw: true,
    });
    const ratingMap = {};
    ratings.forEach((r) => { ratingMap[r.store_id] = r; });

    const stores = rows.map((s) => ({
      ...s.toJSON(),
      avgRating: ratingMap[s.id] ? parseFloat(parseFloat(ratingMap[s.id].avgRating).toFixed(1)) : null,
      totalRatings: ratingMap[s.id] ? parseInt(ratingMap[s.id].totalRatings) : 0,
    }));

    return success(res, { stores, total: count, page: parseInt(page), limit: parseInt(limit) }, 'Stores fetched.');
  } catch (err) {
    console.error('Get admin stores error:', err);
    return error(res, 'Failed to fetch stores.', 500);
  }
};

// ── Create Store (Admin) ──────────────────────────────────────────────────────
const createStore = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return error(res, 'Validation failed.', 422, errors.array());

  try {
    const { name, email, address, owner_id } = req.body;

    const existing = await Store.findOne({ where: { email } });
    if (existing) return error(res, 'A store with this email already exists.', 409);

    if (owner_id) {
      const owner = await User.findOne({ where: { id: owner_id, role: 'store_owner' } });
      if (!owner) return error(res, 'owner_id must reference a user with role store_owner.', 400);
    }

    const store = await Store.create({ name, email, address, owner_id: owner_id || null });
    return success(res, store, 'Store created successfully.', 201);
  } catch (err) {
    console.error('Create store error:', err);
    return error(res, 'Failed to create store.', 500);
  }
};

module.exports = { getStats, getUsers, getUserById, createUser, getAdminStores, createStore };
