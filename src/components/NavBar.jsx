import "../style/NavBar.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";

function NavBar() {
  const navigate = useNavigate();

  const openCreatePost = () => {
    navigate(`/create_post`);
  };

  const openProfile = () => {
    navigate(`/profile`);
  };

  const openHome = () => {
    navigate(`/home`);
  };

  const openChatApp = () => {
    navigate(`/chat`);
  };


  return (
    <nav className="NavBar">
      {/* Logo Section */}
      <div className="logo" onClick={openHome}>
        <a href="#" className="logo-img">
          <i className="fas fa-palette"></i>
        </a>
      </div>

      {/* Search Bar Section */}
      <div className="search-wrapper">
        <SearchBar />
      </div>

      {/* Icons Section */}
      <div className="links">
        <a href="#" className="icon" onClick={openCreatePost}>
          <i className="fas fa-plus"></i>
        </a>
        <a href="#" className="icon" onClick={openHome}>
          <i className="fas fa-home"></i>
        </a>
        <a href="#" className="icon" onClick={openChatApp}>
          <i className="fas fa-comment-dots"></i>
        </a>
        <a href="#" className="icon" onClick={openProfile}>
          <i className="fas fa-user"></i>
        </a>
      </div>
    </nav>
  );
}

export default NavBar;
