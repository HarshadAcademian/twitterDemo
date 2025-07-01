import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Like = ({ postId, initialLikesCount, initialLiked, token }) => {
  const [likesCount, setLikesCount] = useState(initialLikesCount || 0);
  const [liked, setLiked] = useState(initialLiked || false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    setLikesCount(initialLikesCount || 0);
    setLiked(initialLiked || false);
  }, [initialLikesCount, initialLiked]);

  const toggleLike = async () => {
    try {
      const response = await axios.post(
        `http://13.60.28.252:5000/posts/${postId}/like`,
        {},
        { headers }
      );

      if (response.data.liked) {
        setLikesCount((prev) => prev + 1);
        setLiked(true);
      } else {
        setLikesCount((prev) => Math.max(0, prev - 1));
        setLiked(false);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleLike}
        className={`font-medium ${liked ? 'text-pink-500' : 'text-gray-500'} hover:text-pink-600`}
      >
        {liked ? '❤️' : '🤍'} Like
      </button>
      <span className="text-sm">{likesCount} Likes</span>
    </div>
  );
};

export default Like;
