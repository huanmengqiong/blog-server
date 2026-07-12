const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const auth = require('../middleware/auth');

// 公开路由 - 归档（必须放在 /:id 前面）
router.get('/archives/list', articleController.getArchives);

// 公开路由
router.get('/', articleController.getList);
router.get('/:id', articleController.getDetail);

// 需要认证的路由
router.post('/', auth, articleController.create);
router.put('/:id', auth, articleController.update);
router.delete('/:id', auth, articleController.remove);

// 点赞相关
router.post('/:id/like', auth, articleController.toggleLike);
router.get('/:id/like', auth, articleController.getLikeStatus);

module.exports = router;