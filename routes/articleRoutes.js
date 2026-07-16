const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const auth = require('../middleware/auth');

router.get('/archives/list', articleController.getArchives);

router.get('/', articleController.getList);
router.get('/:id', articleController.getDetail);

router.post('/', auth, articleController.create);
router.put('/:id', auth, articleController.update);
router.delete('/:id', auth, articleController.remove);

router.post('/:id/like', auth, articleController.toggleLike);
router.get('/:id/like', auth, articleController.getLikeStatus);

module.exports = router;