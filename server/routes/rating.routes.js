const router = require('express').Router();
const { submitRating, updateRating } = require('../controllers/rating.controller');
const { submitRatingValidator, updateRatingValidator } = require('../validators/rating.validator');

router.post('/', submitRatingValidator, submitRating);
router.put('/:id', updateRatingValidator, updateRating);

module.exports = router;
