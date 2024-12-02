import { useState, useEffect } from "react";
import "../style/HomePosts.css";
import NavBar from "./NavBar.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function HomePosts() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      const authToken = JSON.parse(localStorage.getItem("authToken"));
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/homeposts/",
          {
            headers: {
              Authorization: `Bearer ${authToken.access}`,
            },
          }
        );
        setPosts(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const openPost = (postId) => {
    navigate(`/post/${postId}`);
  };

  return (
    <>
      <NavBar />

      <div className="container">
        {posts.map((post, i) => (
          <img
            src={post.image}
            alt={`Post ${i + 1}`}
            key={i}
            onClick={() => openPost(post.id)}
            id={post.id}
          />
        ))}
      </div>
    </>
  );
}

export { HomePosts };
