const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const articleRoutes = require('./articleRoutes');
const categoryRoutes = require('./categoryRoutes');
const tagRoutes = require('./tagRoutes');
const commentRoutes = require('./commentRoutes');

router.use('/users', userRoutes);
router.use('/articles', articleRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/comments', commentRoutes);

module.exports = router;