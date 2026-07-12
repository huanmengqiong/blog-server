const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const auth = require('../middleware/auth');

// 公开路由
router.get('/', tagController.getAll);

// 需要认证的路由
router.post('/', auth, tagController.create);

module.exports = router;