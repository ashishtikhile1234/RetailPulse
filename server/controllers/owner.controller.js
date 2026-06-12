const { fn, col } = require('sequelize');
const { Store, Rating, User } = require('../models');
const { success, error } = require('../utils/apiResponse.util');

// ── Store Owner Dashboard ─────────────────────────────────────────────────────
const getOwnerDashboard = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { owner_id: req.user.id } });
    if (!store) {
      return error(res, 'No store is linked to your account. Contact an admin.', 404);
    }

    // Average rating for this store
    const avgResult = await Rating.findOne({
      attributes: [
        [fn('AVG', col('value')), 'avgRating'],
        [fn('COUNT', col('Rating.id')), 'totalRatings'],
      ],
      where: { store_id: store.id },
      raw: true,
    });

    // List of users who rated this store with their rating details
    const raters = await Rating.findAll({
      where: { store_id: store.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']],
    });

    return success(res, {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      avgRating: avgResult?.avgRating
        ? parseFloat(parseFloat(avgResult.avgRating).toFixed(1))
        : null,
      totalRatings: parseInt(avgResult?.totalRatings || 0),
      raters: raters.map((r) => ({
        ratingId: r.id,
        value: r.value,
        submittedAt: r.created_at,
        user: r.user,
      })),
    }, 'Dashboard data fetched.');
  } catch (err) {
    console.error('Owner dashboard error:', err);
    return error(res, 'Failed to load dashboard.', 500);
  }
};

module.exports = { getOwnerDashboard };
