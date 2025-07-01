const pool = require('../models/db');

exports.toggleLike = async (req, res) => {
  const userId = req.user.userId;
  const postId = parseInt(req.params.postId);

  try {
    const check = await pool.query(
      'SELECT * FROM POST_LIKE WHERE LIKE_USER_ID = $1 AND LIKE_POST_ID = $2',
      [userId, postId]
    );

    if (check.rows.length > 0) {
      await pool.query(
        'DELETE FROM POST_LIKE WHERE LIKE_USER_ID = $1 AND LIKE_POST_ID = $2',
        [userId, postId]
      );
      return res.json({ liked: false });
    } else {
      await pool.query(
        'INSERT INTO POST_LIKE (LIKE_USER_ID, LIKE_POST_ID) VALUES ($1, $2)',
        [userId, postId]
      );
      return res.json({ liked: true });
    }
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ error: 'Server error toggling like' });
  }
};

exports.getLikes = async (req, res) => {
  const userId = req.user.userId;
  const postId = parseInt(req.params.postId);

  try {
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM POST_LIKE WHERE LIKE_POST_ID = $1',
      [postId]
    );

    const userLikedResult = await pool.query(
      'SELECT 1 FROM POST_LIKE WHERE LIKE_USER_ID = $1 AND LIKE_POST_ID = $2',
      [userId, postId]
    );

    const likes = parseInt(countResult.rows[0].count, 10);
    const liked = userLikedResult.rows.length > 0;

    res.json({ likes, liked });
  } catch (err) {
    console.error('Get likes error:', err);
    res.status(500).json({ error: 'Server error fetching likes' });
  }
};
