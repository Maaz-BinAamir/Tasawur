import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
import "../style/SearchBar.css";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [previousSearches, setPreviousSearches] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const searchRef = useRef(null);
  // const navigate = useNavigate();

  const categories = [
    { name: "Sketching", icon: "fa-pencil" },
    { name: "Painting", icon: "fa-palette" },
    { name: "Digital Art", icon: "fa-desktop" },
    { name: "Journaling", icon: "fa-book" },
    { name: "Photography", icon: "fa-camera" },
    { name: "Doodling", icon: "fa-smile" },
    { name: "Sculpting", icon: "fa-screwdriver" },
    { name: "Crocheting", icon: "fa-mitten" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("previousSearches");
    if (stored) {
      setPreviousSearches(JSON.parse(stored));
    }
  }, []);

  const handleSearch = (query = searchTerm, category = selectedCategory) => {
    if (query && !previousSearches.includes(query)) {
      const updatedSearches = [query, ...previousSearches].slice(0, 5);
      setPreviousSearches(updatedSearches);
      sessionStorage.setItem("previousSearches", JSON.stringify(updatedSearches));
    }

   // navigate(`/search?q=${encodeURIComponent(query)}&category=${category}`);

     window.location.href = `/search?q=${encodeURIComponent(
      query
       )}&category=${category}`;

    setSearchTerm("");
    setSelectedCategory("");
    setShowDropdown(false);
  };

  const handlePreviousSearchSelect = (search) => {
    setSearchTerm(search);
    handleSearch(search);
  };

  return (
    <div ref={searchRef} className="search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search artworks, categories..."
          className="search-input"
          onKeyDown={(e) => e.key === "Enter" && handleSearch(searchTerm)}
        />

        <button onClick={() => handleSearch(searchTerm)} className="search-button">
          <i className="fas fa-search"></i>
        </button>
      </div>

      {showDropdown && (
        <div className="search-dropdown">
          {previousSearches.length > 0 && (
            <div className="recent-searches">
              <p className="recent-searches-title">Recent Searches</p>
              {previousSearches.map((search, index) => (
                <div
                  key={index}
                  onClick={() => handlePreviousSearchSelect(search)}
                  className="recent-search-item"
                >
                  {search}
                </div>
              ))}
            </div>
          )}

          <div>
            <p className="categories-title">Explore Categories</p>
            <div className="categories-grid">
              {categories.map((category, index) => (
                <div
                  key={category.name}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    handleSearch(searchTerm, index + 1);
                  }}
                  className="category-item"
                >
                 <a href="#" className="searchIcon"> <i className={`fa-solid ${category.icon}`}></i> </a>{category.name}
                 
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
