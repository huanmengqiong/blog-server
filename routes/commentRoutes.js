const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

// 公开路由
router.get('/article/:articleId', commentController.getByArticleId);

// 需要认证的路由
router.post('/', auth, commentController.create);
router.delete('/:id', auth, commentController.remove);

module.exports = router;