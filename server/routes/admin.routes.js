const router = require('express').Router();
const { getStats, getUsers, getUserById, createUser, getAdminStores, createStore } = require('../controllers/admin.controller');
const { createUserValidator } = require('../validators/user.validator');
const { createStoreValidator } = require('../validators/store.validator');

// Stats
router.get('/stats', getStats);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUserValidator, createUser);

// Stores
router.get('/stores', getAdminStores);
router.post('/stores', createStoreValidator, createStore);

module.exports = router;
