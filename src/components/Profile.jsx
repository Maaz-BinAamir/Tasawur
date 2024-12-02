// import getUser from "./dummy_items/dummy_users";
import { useState, useEffect } from "react";
import "../style/Profile.css";
import NavBar from "./NavBar.jsx";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function Profile() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const authToken = JSON.parse(localStorage.getItem("authToken")) || {};
        const request_url = id
          ? `http://127.0.0.1:8000/api/profile/${id}`
          : `http://127.0.0.1:8000/api/profile`;
        console.log(request_url);

        const response = await axios.get(request_url, {
          headers: {
            Authorization: `Bearer ${authToken.access}`,
          },
        });
        console.log(response.data);
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching post:", error);
        setLoading(false);
      }
    };

    fetchPost();
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
  return (
    <>
      <NavBar />
      {loading ? (
        <h1>Loading</h1>
      ) : (
        <div className="profile">
          <div className="profile">
            <img src={user.profile_pic} className="profilepfp" />
            <div>{user.username}</div>
          </div>
          <div>
            Followers{user.followers} Following {user.following}
          </div>
          <div>
            <div>{user.bio}</div>
          </div>
          <div>
            <button onClick={openEditProfile}>Edit Profile</button>
            <button onClick={openSharePopup}>Share Profile</button>

            {showPopup && (
              <div className="popup">
                <p>Share this link:</p>
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="popup-input"
                />
                <button onClick={handleCopy}>Copy Link</button>
                {copied && <span className="copied-message">Link copied!</span>}
                <button onClick={() => setShowPopup(false)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
