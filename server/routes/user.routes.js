const router = require('express').Router();
const { changePassword } = require('../controllers/user.controller');
const { changePasswordValidator } = require('../validators/user.validator');

// Available to all authenticated roles
router.put('/me/password', changePasswordValidator, changePassword);

module.exports = router;
