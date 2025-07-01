import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const CommentSection = ({ postId, token }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editId, setEditId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [newCommentError, setNewCommentError] = useState('');
  const [editCommentError, setEditCommentError] = useState('');
  const [actionError, setActionError] = useState('');
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://13.60.28.252:5000/posts/${postId}/comments`, { headers });
      setComments(res.data.comments);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (newComment.length < 2 || newComment.length > 200) {
      setNewCommentError('Comment must be between 2 and 200 characters.');
      return;
    }

    try {
      await axios.post(
        `http://13.60.28.252:5000/posts/${postId}/comments`,
        { content: newComment },
        { headers }
      );
      setNewComment('');
      setNewCommentError('');
      setActionError('');
      fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const updateComment = async (id) => {
    if (!editContent.trim()) return;

    if (editContent.length < 2 || editContent.length > 200) {
      setEditCommentError('Comment must be between 2 and 200 characters.');
      return;
    }

    try {
      await axios.put(
        `http://13.60.28.252:5000/posts/comments/${id}`,
        { content: editContent },
        { headers }
      );
      setEditId(null);
      setEditContent('');
      setEditCommentError('');
      setActionError('');
      fetchComments();
    } catch (err) {
      if (err.response?.status === 403) {
        setActionError('You cannot update this comment.');
      } else {
        console.error('Error updating comment:', err);
      }
    }
  };

  const deleteComment = async (id) => {
    try {
      await axios.delete(`http://13.60.28.252:5000/posts/comments/${id}`, { headers });
      setActionError('');
      fetchComments();
    } catch (err) {
      if (err.response?.status === 403) {
        setActionError('You cannot delete this comment.');
      } else {
        console.error('Error deleting comment:', err);
      }
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div className="mt-4">
      <form onSubmit={addComment} className="flex flex-col md:flex-row gap-2 items-start mb-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
            if (newCommentError) setNewCommentError('');
          }}
          className="flex-1 p-2 border border-gray-300 rounded w-full"
          placeholder="Write a comment..."
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Comment
        </button>
      </form>
      {newCommentError && (
        <p className="text-red-500 text-sm mb-3">{newCommentError}</p>
      )}
      {actionError && (
        <p className="text-red-600 text-sm mb-3">{actionError}</p>
      )}

      <h4 className="font-semibold text-gray-800 mb-2">Comments</h4>

      {loading ? (
        <p className="text-sm text-gray-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <div
            key={comment.comment_id}
            className="bg-gray-100 rounded-md p-3 mb-3 hover:shadow-sm transition"
          >
            {editId === comment.comment_id ? (
              <>
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => {
                    setEditContent(e.target.value);
                    if (editCommentError) setEditCommentError('');
                  }}
                  className="w-full p-2 border border-gray-300 rounded mb-1"
                />
                {editCommentError && (
                  <p className="text-red-500 text-sm mb-2">{editCommentError}</p>
                )}
                <div className="flex gap-2 text-white text-sm">
                  <button
                    className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
                    onClick={() => updateComment(comment.comment_id)}
                  >
                    <FaSave className="inline mr-1" /> Save
                  </button>
                  <button
                    className="bg-gray-400 px-3 py-1 rounded hover:bg-gray-500"
                    onClick={() => {
                      setEditId(null);
                      setEditContent('');
                      setEditCommentError('');
                      setActionError('');
                    }}
                  >
                    <FaTimes className="inline mr-1" /> Cancel
                  </button>
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm uppercase">
                    {comment.user_name
                      .split(' ')
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')}
                  </div>

                  <div className="flex-1">
                    <p className="text-gray-800">{comment.comment_text}</p>
                    <small className="text-gray-500 block text-xs mt-1">
                      by {comment.user_name} •{' '}
                      {new Date(comment.comment_created_at).toLocaleString()}
                    </small>
                    <div className="mt-1 flex gap-3 text-sm">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          setEditId(comment.comment_id);
                          setEditContent(comment.comment_text);
                          setEditCommentError('');
                          setActionError('');
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => deleteComment(comment.comment_id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default CommentSection;
