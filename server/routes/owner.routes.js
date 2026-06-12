const router = require('express').Router();
const { getOwnerDashboard } = require('../controllers/owner.controller');

router.get('/dashboard', getOwnerDashboard);

module.exports = router;
