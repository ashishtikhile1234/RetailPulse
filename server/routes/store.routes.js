const router = require('express').Router();
const { getStores } = require('../controllers/store.controller');

router.get('/', getStores);

module.exports = router;
