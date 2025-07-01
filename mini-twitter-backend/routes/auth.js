const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signup, login, getCurrentUser,softDeleteUser } = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');

router.post('/signup', [
  body('name').isLength({ min: 2 }).withMessage('Name too short'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password too short')
], signup);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

router.get('/me', verifyToken, getCurrentUser);

router.delete('/me', verifyToken, softDeleteUser);

module.exports = router;
