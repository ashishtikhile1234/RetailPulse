const { body } = require('express-validator');

const createStoreValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Store name is required.')
    .isLength({ min: 20, max: 60 }).withMessage('Store name must be between 20 and 60 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Store email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('address')
    .trim()
    .notEmpty().withMessage('Store address is required.')
    .isLength({ max: 400 }).withMessage('Address must not exceed 400 characters.'),

  body('owner_id')
    .optional()
    .isInt({ min: 1 }).withMessage('owner_id must be a valid user ID.'),
];

module.exports = { createStoreValidator };
