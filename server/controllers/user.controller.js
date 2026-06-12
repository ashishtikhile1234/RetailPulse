const { validationResult } = require('express-validator');
const { User } = require('../models');
const { hashPassword, comparePassword } = require('../utils/hash.util');
const { success, error } = require('../utils/apiResponse.util');

// ── Change Password ───────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return error(res, 'Validation failed.', 422, errors.array());

  try {
    const { currentPassword, newPassword } = req.body;

    // Re-fetch with password to verify current password
    const user = await User.unscoped().findByPk(req.user.id);
    const isMatch = await comparePassword(currentPassword, user.password);

    if (!isMatch) {
      return error(res, 'Current password is incorrect.', 400);
    }

    const hashedNew = await hashPassword(newPassword);
    await user.update({ password: hashedNew });

    return success(res, null, 'Password updated successfully.');
  } catch (err) {
    console.error('Change password error:', err);
    return error(res, 'Failed to update password.', 500);
  }
};

module.exports = { changePassword };
