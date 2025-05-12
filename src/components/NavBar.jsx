import "../style/NavBar.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import axios from "axios";
import logo from "../assets/images/logo.png";
import Notification from "./Notification";

function NavBar() {
  const navigate = useNavigate();

  const openCreatePost = () => {
    navigate(`/create_post`);
  };

  const openProfile = () => {
    navigate(`/profile`);
  };

  const openHome = () => {
    navigate(`/`);
  };

  const openChatApp = () => {
    navigate(`/chat`);
  };

  const logoutUser = async () => {
    const authToken = JSON.parse(localStorage.getItem("authToken")) || {};
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/logout/",
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken.access}`,
          },
        }
      );
      localStorage.removeItem("authToken");
      localStorage.removeItem("userID");
      navigate(`/login`);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="NavBar">
      {/* Logo Section */}
      <div className="logo" onClick={openHome}>
        <img className="logo-img" src={logo} alt="Description" />
      </div>

      {/* Search Bar Section */}
      <div className="search-wrapper">
        <SearchBar />
      </div>

      {/* Icons Section */}
      <div className="links">
        <button className="icon" onClick={openCreatePost}>
          <i className="fas fa-plus"></i>
        </button>
        <button className="icon" onClick={openHome}>
          <i className="fas fa-home"></i>
        </button>
        <button className="icon" onClick={openChatApp}>
          <i className="fas fa-comment-dots"></i>
        </button>
        <button className="icon" onClick={openProfile}>
          <i className="fas fa-user"></i>
        </button>
        <Notification />
        <button className="icon" onClick={logoutUser}>
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
