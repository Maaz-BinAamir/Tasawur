import "../App.css";
import NavBar from "./NavBar.jsx";
import axios from "axios";
import Comments from "./Comments.jsx";
import Loader from "./Utility/Loader.jsx";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../style/Posts.css";
import { Heart, MessageCircle, MoreVertical } from "lucide-react";
import { formatDistanceToNow, set } from "date-fns";

function Post() {
  const { postID } = useParams();

  const [isAuthor, setIsAuthor] = useState("");
  const [post, setPost] = useState(null);
  const [currentLikes, setCurrentLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const authToken = JSON.parse(localStorage.getItem("authToken")) || {};

        const response = await axios.get(
          `http://127.0.0.1:8000/api/posts/${postID}`,
          {
            headers: {
              Authorization: `Bearer ${authToken.access}`,
            },
          }
        );
        console.log(response.data);
        setPost(response.data);
        setCurrentLikes(response.data.likes);
        setHasLiked(response.data.hasLiked);
        setIsAuthor(response.data.isAuthor);
        setHasSaved(response.data.hasSaved);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching post:", error);
        setLoading(false);
      }
    };

    fetchPost();
  }, [postID]);

  const handleDelete = async () => {
    try {
      setDropdownVisible(false);

      const authToken = JSON.parse(localStorage.getItem("authToken")) || {};

      await axios.delete(`http://127.0.0.1:8000/api/posts/delete/${postID}/`, {
        headers: {
          Authorization: `Bearer ${authToken.access}`,
        },
      });

      navigate("/");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleSave = async () => {
    try {
      setDropdownVisible(false);

      const authToken = JSON.parse(localStorage.getItem("authToken")) || {};

      await axios.post(
        `http://127.0.0.1:8000/api/posts/${postID}/save/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken.access}`,
          },
        }
      );
      setHasSaved((saved) => !saved);
    } catch (error) {
      console.error("Error saving/unsaving post:", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLike = async () => {
    setHasLiked((liked) => !liked);
    setCurrentLikes(hasLiked ? currentLikes - 1 : currentLikes + 1);

    try {
      const authToken = JSON.parse(localStorage.getItem("authToken")) || {};

      await axios.post(
        `http://127.0.0.1:8000/api/posts/${postID}/like/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken.access}`,
          },
        }
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const openSharePopup = () => {
    setShowPopup(true);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/post/${postID}`)
      .then(() => {
        setCopied(true);
      });
  };

  const openProfile = (id) => {
    navigate(`/profile/${id}`);
  };

  return (
    <>
      <NavBar />

      {loading && <Loader />}
      {!loading && post && (
        <div className="post-detail-container">
          <div className="post-detail-wrapper">
            <div className="post-header">
              <div
                className="post-author-info"
                onClick={() => openProfile(post.author.id)}
              >
                <img
                  src={post.author.profile_picture}
                  alt={post.author.username}
                  className="post-author-pfp"
                />
                <strong className="post-author-name">
                  {post.author.username}
                </strong>
              </div>
              <div className="post-options-container">
                <button
                  className="options-btn"
                  onClick={toggleDropdown}
                  aria-label="Post Options"
                >
                  <MoreVertical size={20} />
                </button>

                {dropdownVisible && (
                  <div className="dropdown-menu">
                    <button className="dropdown-option" onClick={handleSave}>
                      {hasSaved ? "Unsave Post" : "Save Post"}
                    </button>
                    {isAuthor && (
                      <button
                        className="dropdown-option"
                        onClick={handleDelete}
                      >
                        Delete Post
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="post-image-container">
              <img
                src={post.url}
                alt={`Post ${postID}`}
                className="post-image"
              />
            </div>

            <div className="post-interactions">
              <div className="interaction-buttons">
                <button
                  onClick={handleLike}
                  className={`like-button ${hasLiked ? "liked" : ""}`}
                >
                  <Heart
                    fill={hasLiked ? "red" : "none"}
                    color={hasLiked ? "red" : "black"}
                    strokeWidth={hasLiked ? 0 : 2}
                  />
                </button>
                <span className="likes-count">{currentLikes} likes</span>

                <button onClick={openSharePopup} className="share-button">
                  Share
                </button>
              </div>

              <div className="post-description-text">{post.description}</div>
              <span className="post-timestamp">
                {formatDistanceToNow(new Date(post.time_created), {
                  addSuffix: true,
                })}
              </span>
              {showPopup && (
                <div className="popup-overlay">
                  <div className="popup-container">
                    <button
                      onClick={() => setShowPopup(false)}
                      className="popup-close"
                    >
                      &times;
                    </button>
                    <h2 className="popup-title">Share This Post</h2>
                    <div className="popup-content">
                      <input
                        type="text"
                        value={`${window.location.origin}/post/${postID}`}
                        readOnly
                        className="popup-input"
                      />
                      <button onClick={handleCopy} className="popup-copy-btn">
                        {copied ? "Copied!" : "Copy Link"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="comments-section">
                <div className="comments-header">
                  <MessageCircle size={20} />
                  <span>Comments</span>
                </div>

                <Comments postID={postID} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Post;
