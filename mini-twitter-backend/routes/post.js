const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const verifyToken = require('../middleware/verifyToken');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');
const sanitizeBody = require('../middleware/sanitizeBody');

// --- POST ROUTES ---

// Create a post
router.post(
  '/',
  verifyToken,
  [
    body('content')
      .trim()
      .escape()
      .isLength({ min: 5 })
      .withMessage('Content must be at least 5 characters long'),
  ],
  postController.createPost
);

// Get all posts
router.get('/', verifyToken, postController.getPosts);

// Update a post
router.put(
  '/:id',
  verifyToken,
  [
    body('content')
      .trim()
      .escape()
      .isLength({ min: 5 })
      .withMessage('Content must be at least 5 characters long'),
  ],
  postController.updatePost
);

// Delete a post
router.delete('/:id', verifyToken, postController.deletePost);

// --- COMMENT ROUTES ---

// Get comments for a post
router.get('/:postId/comments', verifyToken, commentController.getComments);

// Add a comment
router.post(
  '/:postId/comments',
  verifyToken,
  [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content cannot be empty'),
    sanitizeBody(['content'])
  ],
  commentController.addComment
);

// Update a comment
router.put(
  '/comments/:id',
  verifyToken,
  [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Updated comment content cannot be empty'),
    sanitizeBody(['content'])
  ],
  commentController.updateComment
);

// Delete a comment
router.delete('/comments/:id', verifyToken, commentController.deleteComment);

// --- LIKE ROUTES ---

// Toggle like
router.post('/:postId/like', verifyToken, likeController.toggleLike);

// Get likes for a post
router.get('/:postId/likes', verifyToken, likeController.getLikes);

module.exports = router;
