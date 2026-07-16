const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.get('/article/:articleId', commentController.getByArticleId);

router.post('/', auth, commentController.create);
router.delete('/:id', auth, commentController.remove);

module.exports = router;