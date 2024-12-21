import "@fortawesome/fontawesome-free/css/all.min.css";
import "../style/SearchMenu.css";


function SearchMenu() {
  return (
    <div className="search-menu">
      
      <ul>
      <h3>Categories</h3>
      <div className="sIcon">
        <button><a href="#" className="searchIcon">
        <i className="fas fa-pencil"></i>
        </a>
        Sketching</button>
        <button>
        <a href="#" className="searchIcon">
        <i className="fas fa-palette"></i>
        </a>Painting</button>
        <button>
        <a href="#" className="searchIcon">
        <i className="fa-solid fa-desktop"></i>
        </a>Digital Art</button>
        <button>
        <a href="#" className="searchIcon">
        <i className="fa-solid fa-book"></i>
        </a>Journaling</button>
        <button>
        <a href="#" className="searchIcon">
        <i className="fa-solid fa-camera"></i>
        </a>Photography</button>
        <button>
        <a href="#" className="searchIcon">
        <i className="fa-solid fa-smile"></i>
        </a>Doodling</button>
        <button>
        <a href="#" className="searchIcon">
        <i className="fa-solid fa-screwdriver"></i>
        </a>Sculpting</button>
        <button>
        <a href="#" className="searchIcon">
        <i className="fa-solid fa-yarn"></i>
        </a>Crocheting</button>
        </div>
      </ul>
    </div>
  );
}

export default SearchMenu;