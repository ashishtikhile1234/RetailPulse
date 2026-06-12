const { body } = require('express-validator');
const { PASSWORD_REGEX, PASSWORD_MSG } = require('./auth.validator');

const createUserValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 400 }).withMessage('Address must not exceed 400 characters.'),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .matches(PASSWORD_REGEX).withMessage(PASSWORD_MSG),

  body('role')
    .notEmpty().withMessage('Role is required.')
    .isIn(['admin', 'user', 'store_owner']).withMessage('Role must be admin, user, or store_owner.'),
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required.'),

  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .matches(PASSWORD_REGEX).withMessage(PASSWORD_MSG),
];

module.exports = { createUserValidator, changePasswordValidator };
