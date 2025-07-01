import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CommentSection from '../components/CommentSection';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Like from '../components/Like';  // Import the Like component

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [userName, setUserName] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get('http://13.60.28.252:5000/auth/me', { headers });
        setUserName(res.data.user.user_name);
        setUserId(res.data.user.user_id);
      } catch {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUser();
  }, [token]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://13.60.28.252:5000/posts', { headers });

      const postsWithLikes = await Promise.all(
  res.data.posts.map(async (post) => {
    try {
      const likeRes = await axios.get(`http://13.60.28.252:5000/posts/${post.post_id}/likes`, { headers });
      return {
        ...post,
        likesCount: likeRes.data.likes,
        liked: likeRes.data.liked, //for dynamic like checking
      };
    } catch {
      return { ...post, likesCount: 0, liked: false };
    }
  })
);


      setPosts(postsWithLikes);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  };

  useEffect(() => {
    if (token) fetchPosts();
  }, [token]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (content.length < 5 || content.length > 280) {
      setMessage('Post must be between 5 and 280 characters.');
      return;
    }

    try {
      await axios.post('http://13.60.28.252:5000/posts', { content }, { headers });
      setContent('');
      setMessage('');
      fetchPosts();
    } catch (err) {
      setMessage('Error posting. Try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://13.60.28.252:5000/posts/${id}`, { headers });
      fetchPosts();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const handleEdit = (id, currentContent) => {
    setEditingPostId(id);
    setEditContent(currentContent);
  };

  const submitEdit = async (id) => {
    if (editContent.length < 5 || editContent.length > 280) {
      setMessage('Post must be between 5 and 280 characters.');
      return;
    }

    try {
      await axios.put(`http://13.60.28.252:5000/posts/${id}`, { content: editContent }, { headers });
      setEditingPostId(null);
      setEditContent('');
      setMessage('');
      fetchPosts();
    } catch (err) {
      setMessage('Update failed.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;

    try {
      await axios.delete('http://13.60.28.252:5000/auth/me', { headers });
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      alert('Failed to delete account');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />

      <main className="flex-1 p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Hi, {userName}!</h2>

        {message && <div className="mb-4 text-red-600 font-medium">{message}</div>}

        <form onSubmit={handlePost} className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="What's happening?"
            rows="3"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Tweet
          </button>
        </form>

        <h3 className="text-xl font-semibold mb-2">Recent Tweets</h3>
        {posts.map((post) => (
          <div key={post.post_id} className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm uppercase">
                {post.user_name
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800">{post.user_name}</h4>
                  <small className="text-gray-500 text-sm">
                    {new Date(post.post_created_at).toLocaleString()}
                  </small>
                </div>

                {editingPostId === post.post_id ? (
                  <>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 border rounded mt-2"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        onClick={() => submitEdit(post.post_id)}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                        onClick={() => setEditingPostId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 mt-2">{post.post_content}</p>
                    <div className="flex items-center gap-4 mt-3 text-gray-600">
                      {/* Use Like component */}
                      <Like
                        postId={post.post_id}
                        initialLikesCount={post.likesCount}
                        initialLiked={post.liked}
                        token={token}
                      />

                      {post.post_user_id === userId && (
                        <div className="flex gap-3 text-lg ml-auto">
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => handleEdit(post.post_id, post.post_content)}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(post.post_id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 bg-gray-50 rounded-lg">
              <CommentSection postId={post.post_id} token={token} />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Home;