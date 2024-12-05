import "../style/NavBar.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useNavigate } from "react-router-dom";

function NavBar() {
  const navigate = useNavigate();

  const openProfile = () => {
    navigate(`/profile`);
  };

  const openHome = () => {
    navigate(`/homeposts`);
  };

  return (
    <>
      <nav className="NavBar">
        {/* Logo Section */}
        <div className="logo" onClick={openHome}>
          <img src="logo.jpg" alt="Logo" className="logo-img" />
        </div>

        {/* Search Bar Section */}
        <div className="searchBar">
          <input type="text" className="search" placeholder="Search" />
        </div>

        {/* Icons Section */}
        <div className="links">
          <a href="#" className="icon" onClick={openHome}>
            <i className="fas fa-home"></i>
          </a>
          <a href="#" className="icon">
            <i className="fas fa-comment-dots"></i>
          </a>
          <a href="#" className="icon" onClick={openProfile}>
            <i className="fas fa-user"></i>
          </a>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
