const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const pool = require('../models/db');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name, email, password, location } = req.body;
  try {
    const userExists = await pool.query('SELECT * FROM "USER" WHERE USER_EMAIL = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO "USER" (USER_NAME, USER_EMAIL, USER_PASSWORD, USER_LOCATION) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, location]
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
  console.error('Signup error:', err);  // 👈 full error (not just err.message)
  res.status(500).json({ error: 'Server error' });
}
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { email, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM "USER" WHERE USER_EMAIL = $1 AND USER_IS_DELETED = 0', [email]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.user_password);

    if (!match) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

//to get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await pool.query(
      'SELECT USER_ID, USER_NAME, USER_EMAIL, USER_LOCATION FROM "USER" WHERE USER_ID = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.softDeleteUser = async (req, res) => {
  const userId = req.user.userId;

  try {
    await pool.query(
      'UPDATE "USER" SET USER_IS_DELETED = 1 WHERE USER_ID = $1',
      [userId]
    );
    res.json({ message: 'Account has been deleted (soft deleted)' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Server error while deleting user' });
  }
};
