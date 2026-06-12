const { validationResult } = require('express-validator');
const { Rating, Store } = require('../models');
const { success, error } = require('../utils/apiResponse.util');

// ── Submit Rating ─────────────────────────────────────────────────────────────
const submitRating = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return error(res, 'Validation failed.', 422, errors.array());

  try {
    const { store_id, value } = req.body;
    const user_id = req.user.id;

    const store = await Store.findByPk(store_id);
    if (!store) return error(res, 'Store not found.', 404);

    const existing = await Rating.findOne({ where: { user_id, store_id } });
    if (existing) {
      return error(res, 'You have already rated this store. Use PUT to update your rating.', 409);
    }

    const rating = await Rating.create({ user_id, store_id, value });
    return success(res, rating, 'Rating submitted successfully.', 201);
  } catch (err) {
    console.error('Submit rating error:', err);
    return error(res, 'Failed to submit rating.', 500);
  }
};

// ── Update Rating ─────────────────────────────────────────────────────────────
const updateRating = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return error(res, 'Validation failed.', 422, errors.array());

  try {
    const { value } = req.body;
    const rating = await Rating.findByPk(req.params.id);

    if (!rating) return error(res, 'Rating not found.', 404);
    if (rating.user_id !== req.user.id) {
      return error(res, 'You can only modify your own ratings.', 403);
    }

    await rating.update({ value });
    return success(res, rating, 'Rating updated successfully.');
  } catch (err) {
    console.error('Update rating error:', err);
    return error(res, 'Failed to update rating.', 500);
  }
};

module.exports = { submitRating, updateRating };
