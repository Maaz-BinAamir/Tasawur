import getUser from "./DummyUsers";
import { useState } from "react";
import '../App.css';
import NavBar from "./NavBar.jsx";
import {
  useNavigate
} from "react-router-dom";

function Profile(){
  const [user] = getUser();
  const [showPopup, setShowPopup] = useState(false);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  const openEditProfile = () => {
    navigate(`/EditProfile`);
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
  return(
    <>
      <NavBar />
      <div>
      <img
          src={user.profilePic} className="profilepfp"
          />
      <div>{user.username}</div>
      </div>
      <div>
        Followers{user.followers} Following {user.following}
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

    </>
  );
}

export default Profile;