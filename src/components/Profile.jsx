import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "./NavBar.jsx";
import "../style/Profile.css";

function Profile() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const authToken = JSON.parse(localStorage.getItem("authToken")) || {};
        console.log(id);
        const request_url = id
          ? `http://127.0.0.1:8000/api/profile/${id}`
          : `http://127.0.0.1:8000/api/profile`;

        const response = await axios.get(request_url, {
          headers: {
            Authorization: `Bearer ${authToken.access}`,
          },
        });

        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const openEditProfile = () => {
    navigate(`/edit_profile`);
  };

  const openSharePopup = () => {
    setShowPopup(true);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
    });
  };

  const openPost = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <NavBar />
      <div className="profile-container">
        <div className="profile-header">
          <img
            src={user.profile_pic}
            alt="Profile"
            className="profile-picture"
          />

          <div className="profile-details">
            <h1 className="profile-username">{user.username}</h1>

            <div className="profile-stats">
              <span>{user.posts.length} posts</span>
              <span>{user.followers} followers</span>
              <span>{user.following} following</span>
            </div>

            <p className="profile-bio">{user.bio}</p>

            <div className="profile-actions">
              <button
                onClick={openEditProfile}
                className="profile-btn edit-btn"
              >
                Edit Profile
              </button>
              <button
                onClick={openSharePopup}
                className="profile-btn share-btn"
              >
                Share Profile
              </button>
            </div>
          </div>

          {showPopup && (
            <div className="popup-overlay">
              <div className="popup-container">
                <button
                  onClick={() => setShowPopup(false)}
                  className="popup-close"
                >
                  &times;
                </button>
                <h2 className="popup-title">Share Your Profile</h2>
                <div className="popup-content">
                  <input
                    type="text"
                    value={window.location.href}
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
        </div>

        <div className="posts-section">
          {user.posts.length > 0 ? (
            <div className="posts-grid">
              {user.posts.map((post) => (
                <div
                  key={post.id}
                  className="post-item"
                  onClick={() => openPost(post.id)}
                >
                  <img
                    src={post.image}
                    alt={post.description}
                    className="post-image-profile"
                  />
                  <div className="post-overlay">
                    <p className="post-description">{post.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-posts">No posts available.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;
