import "../App.css";
import NavBar from "./NavBar.jsx";
import links from "./dummy_items/links.js";
import { useNavigate } from "react-router-dom";

function HomePosts() {
  const navigate = useNavigate();

  const openPost = (postID) => {
    navigate(`/Post/${postID}`);
  };

  return (
    <>
      <NavBar />

      <div className="container">
        {links.map((link, i) => (
          <img
            src={link.url}
            alt={`Post ${i + 1}`}
            key={i}
            onClick={() => openPost(i)}
            id={link.id}
          />
        ))}
      </div>
    </>
  );
}

export { HomePosts };
