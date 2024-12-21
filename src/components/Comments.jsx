import "../style/Comments.css";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";

const apiUrl = "http://localhost:8000/api";

function OneComment({ comment, onLike }) {
  const { id, user_id, content, likes, time_created, liked } = comment;
  const [currentLikes, setCurrentLikes] = useState(parseInt(likes));
  const [hasLiked, setHasLiked] = useState(liked);

  const navigate = useNavigate();

  const handleLike = async () => {
    setHasLiked(!hasLiked);
    setCurrentLikes((prev) => (hasLiked ? prev - 1 : prev + 1));

    try {
      const authToken = JSON.parse(localStorage.getItem("authToken")) || {};
      await axios.post(
        `${apiUrl}/comments/${id}/like/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken.access}`,
          },
        }
      );
    } catch (error) {
      console.error("Error liking comment:", error);
      setHasLiked((prev) => !prev);
      setCurrentLikes((prev) => (hasLiked ? prev + 1 : prev - 1));
    }
  };

  const openProfile = () => {
    navigate(`/profile/${user_id.id}`);
  };

  return (
    <div className="single-comment">
      <div className="comment-user-info">
        <img
          src={user_id.profile_picture}
          alt={user_id.username}
          className="comment-user-pfp"
          onClick={openProfile}
        />
        <div className="comment-content-wrapper">
          <div className="comment-header">
            <strong className="comment-username">{user_id.username}</strong>
            <span className="comment-timestamp">
              {formatDistanceToNow(new Date(time_created), { addSuffix: true })}
            </span>
          </div>
          <p className="comment-text">{content}</p>
          <div className="comment-actions">
            <button
              onClick={handleLike}
              className={`comment-like-button ${hasLiked ? "liked" : ""}`}
            >
              {hasLiked ? "Unlike" : "Like"}
            </button>
            <span className="comment-likes-count">{currentLikes} likes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MakeComment({ onAddComment, postID }) {
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const authToken = JSON.parse(localStorage.getItem("authToken")) || {};
      const response = await axios.post(
        `${apiUrl}/posts/${postID}/create_comment/`,
        { content: text },
        {
          headers: {
            Authorization: `Bearer ${authToken.access}`,
          },
        }
      );
      onAddComment(response.data);
      console.log(response.data);
      setText("");
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  return (
    <form className="make-comment-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment..."
        className="comment-input"
      />
      <button type="submit" className="comment-submit-btn">
        Post
      </button>
    </form>
  );
}

function Comments({ postID }) {
  const [comments, setComments] = useState([]);

  const fetchComments = useCallback(async () => {
    try {
      const authToken = JSON.parse(localStorage.getItem("authToken")) || {};
      const response = await axios.get(`${apiUrl}/posts/${postID}/comments`, {
        headers: {
          Authorization: `Bearer ${authToken.access}`,
        },
      });
      setComments(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [postID]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = (newComment) => {
    setComments((prevComments) => [newComment, ...prevComments]);
  };

  return (
    <div className="comments-section">
      <MakeComment onAddComment={addComment} postID={postID} />
      {comments.length === 0 ? (
        <p className="no-comments">No comments yet</p>
      ) : (
        comments.map((comment) => (
          <OneComment
            key={comment.id}
            comment={comment}
            onLike={() => fetchComments()}
          />
        ))
      )}
    </div>
  );
}

export default Comments;
