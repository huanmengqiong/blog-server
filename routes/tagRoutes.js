const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const auth = require('../middleware/auth');

router.get('/', tagController.getAll);

router.post('/', auth, tagController.create);

module.exports = router;