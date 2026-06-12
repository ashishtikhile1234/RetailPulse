const { Op, fn, col } = require('sequelize');
const { Store, Rating, User } = require('../models');
const { success, error } = require('../utils/apiResponse.util');

// ── List Stores for Normal Users ──────────────────────────────────────────────
const getStores = async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10 } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const allowedSort = ['name', 'address', 'created_at'];
    const order = [[allowedSort.includes(sortBy) ? sortBy : 'name', sortOrder === 'desc' ? 'DESC' : 'ASC']];
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Store.findAndCountAll({ where, order, limit: parseInt(limit), offset });

    if (rows.length === 0) {
      return success(res, { stores: [], total: 0, page: parseInt(page), limit: parseInt(limit) }, 'No stores found.');
    }

    const storeIds = rows.map((s) => s.id);

    // Bulk fetch average ratings for all stores
    const avgRatings = await Rating.findAll({
      attributes: ['store_id', [fn('AVG', col('value')), 'avgRating'], [fn('COUNT', col('id')), 'totalRatings']],
      where: { store_id: storeIds },
      group: ['store_id'],
      raw: true,
    });
    const avgMap = {};
    avgRatings.forEach((r) => { avgMap[r.store_id] = r; });

    // Fetch this user's own ratings for these stores
    const userRatings = await Rating.findAll({
      where: { store_id: storeIds, user_id: req.user.id },
      raw: true,
    });
    const userRatingMap = {};
    userRatings.forEach((r) => { userRatingMap[r.store_id] = r; });

    const stores = rows.map((s) => ({
      ...s.toJSON(),
      avgRating: avgMap[s.id] ? parseFloat(parseFloat(avgMap[s.id].avgRating).toFixed(1)) : null,
      totalRatings: avgMap[s.id] ? parseInt(avgMap[s.id].totalRatings) : 0,
      userRating: userRatingMap[s.id]
        ? { id: userRatingMap[s.id].id, value: userRatingMap[s.id].value }
        : null,
    }));

    return success(res, { stores, total: count, page: parseInt(page), limit: parseInt(limit) }, 'Stores fetched.');
  } catch (err) {
    console.error('Get stores error:', err);
    return error(res, 'Failed to fetch stores.', 500);
  }
};

module.exports = { getStores };
