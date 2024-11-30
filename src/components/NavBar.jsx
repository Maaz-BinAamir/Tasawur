import "../App.css";
import {
  useNavigate
} from "react-router-dom";

function NavBar(){
  const navigate = useNavigate();

  const openProfile = () => {
    navigate(`/Profile`);
  };

  const openHome = () => {
    navigate(`/`);
  };

    return(
      <>
        <nav className="NavBar">
        <div className="logo">MyLogo</div>
        <div className="searchBar">
          <input type="text" placeholder="Search..." />
          <button>Search</button>
        </div>
        <div >
          <button onClick={openProfile}><img src="" alt="Profile" /></button>
          <button onClick={openHome}><img src="" alt="Home" /></button>
          <button><img src="" alt="Chats" /></button>
        </div>
        </nav>
      </>
    );
  }
  
  export default NavBar;