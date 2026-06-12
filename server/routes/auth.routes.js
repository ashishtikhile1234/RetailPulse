const router = require('express').Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/me', requireAuth, getMe);

module.exports = router;
