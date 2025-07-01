const pool = require('../models/db');

// Get comments for a post
exports.getComments = async (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  if (isNaN(postId)) {
    return res.status(400).json({ error: 'Invalid postId parameter' });
  }

  try {
    const result = await pool.query(
      `SELECT c.COMMENT_ID AS comment_id, c.COMMENT_TEXT AS comment_text, c.COMMENT_CREATED_AT AS comment_created_at, u.USER_NAME AS user_name
       FROM "COMMENT" c
       JOIN "USER" u ON c.COMMENT_USER_ID = u.USER_ID
       WHERE c.COMMENT_POST_ID = $1 AND c.COMMENT_IS_DELETED = 0
       ORDER BY c.COMMENT_CREATED_AT DESC`,
      [postId]
    );
    return res.json({ comments: result.rows });
  } catch (err) {
    console.error('Get comments error:', err);
    return res.status(500).json({ error: 'Server error fetching comments' });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Comment content cannot be empty' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO "COMMENT" (COMMENT_POST_ID, COMMENT_USER_ID, COMMENT_TEXT) 
       VALUES ($1, $2, $3) RETURNING COMMENT_ID AS comment_id, COMMENT_TEXT AS comment_text, COMMENT_CREATED_AT AS comment_created_at`,
      [postId, userId, content]
    );

    res.status(201).json({ message: 'Comment added successfully', comment: result.rows[0] });
  } catch (err) {
    console.error('Add comment error:', err.message);
    res.status(500).json({ error: 'Server error adding comment' });
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Updated comment content cannot be empty' });
  }

  try {
    const result = await pool.query(
      `UPDATE "COMMENT"
       SET COMMENT_TEXT = $1, COMMENT_UPDATED_AT = CURRENT_TIMESTAMP
       WHERE COMMENT_ID = $2 AND COMMENT_USER_ID = $3 AND COMMENT_IS_DELETED = 0
       RETURNING COMMENT_ID AS comment_id, COMMENT_TEXT AS comment_text, COMMENT_UPDATED_AT AS comment_updated_at`,
      [content, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Comment not found or you are not authorized to update it' });
    }

    res.json({ message: 'Comment updated successfully', comment: result.rows[0] });
  } catch (err) {
    console.error('Update comment error:', err.message);
    res.status(500).json({ error: 'Server error updating comment' });
  }
};

// Delete comment (soft delete)
exports.deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `UPDATE "COMMENT"
       SET COMMENT_IS_DELETED = 1, COMMENT_UPDATED_AT = CURRENT_TIMESTAMP
       WHERE COMMENT_ID = $1 AND COMMENT_USER_ID = $2 AND COMMENT_IS_DELETED = 0
       RETURNING COMMENT_ID AS comment_id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Comment not found or you are not authorized to delete it' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Delete comment error:', err.message);
    res.status(500).json({ error: 'Server error deleting comment' });
  }
};
