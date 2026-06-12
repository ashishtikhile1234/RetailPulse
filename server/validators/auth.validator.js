const { body } = require('express-validator');

// Shared regex for password validation
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
const PASSWORD_MSG =
  'Password must be 8–16 characters and include at least one uppercase letter and one special character (!@#$%^&*).';

const registerValidator = [
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
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

module.exports = { registerValidator, loginValidator, PASSWORD_REGEX, PASSWORD_MSG };
