const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');

// 公开路由
router.get('/', categoryController.getAll);

// 需要认证的路由（管理员功能，此处简化）
router.post('/', auth, categoryController.create);

module.exports = router;