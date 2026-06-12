const { body } = require('express-validator');

const submitRatingValidator = [
  body('store_id')
    .notEmpty().withMessage('store_id is required.')
    .isInt({ min: 1 }).withMessage('store_id must be a valid store ID.'),

  body('value')
    .notEmpty().withMessage('Rating value is required.')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be a whole number between 1 and 5.'),
];

const updateRatingValidator = [
  body('value')
    .notEmpty().withMessage('Rating value is required.')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be a whole number between 1 and 5.'),
];

module.exports = { submitRatingValidator, updateRatingValidator };
