import "../App.css";
import NavBar from "./NavBar.jsx";
import axios from "axios";
import Comments from "./Comments.jsx";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function Post() {
  const { postID } = useParams();

  const [post, setPost] = useState(null);
  const [currentLikes, setCurrentLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch post data when the component mounts
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const authToken = JSON.parse(localStorage.getItem("authToken")) || {};

        const response = await axios.get(
          `http://127.0.0.1:8000/api/posts/${postID}`,
          {
            headers: {
              Authorization: `Bearer ${authToken.access}`,
            },
          }
        );
        console.log(response.data);
        setPost(response.data);
        setCurrentLikes(response.data.likes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching post:", error);
        setLoading(false);
      }
    };

    fetchPost();
  }, [postID]);

  // const updateLikes = async (postId, newLikes) => {
  //   const authToken = JSON.parse(localStorage.getItem("authToken"));

  //   try {
  //     const response = await axios.put(
  //       `http://127.0.0.1:8000/api/posts/update/${postId}/`,
  //       { likes: newLikes },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${authToken.access}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     console.log("Post updated successfully:", response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error(
  //       "Error updating likes:",
  //       error.response?.data || error.message
  //     );
  //     throw error;
  //   }
  // };

  const handleLike = () => {
    // setPost((post) =>
    // updateLikes(post.id, hasLiked ? post.likes + 1 : post.likes - 1)
    // );
    setHasLiked((liked) => !liked);
  };

  return (
    <>
      <NavBar />
      {post ? (
        <>
          <div>
            <div>
              <img src={post.profile_pic} className="pfp" />
              <strong>{post.author}</strong>
            </div>
            <div>
              {loading ? (
                <h1>Loading ...</h1>
              ) : (
                <img
                  src={post.url}
                  alt={`Post ${postID}`}
                  style={{ width: "30%", height: "auto" }}
                />
              )}
            </div>
            <div>
              <div>
                <button onClick={handleLike}>
                  {hasLiked ? "Liked" : "Like"}
                </button>
                <span> {currentLikes}</span>
              </div>
              <div>
                <p>{post.description}</p>
              </div>
              <h2>{post.createdAt}</h2>
              <Comments postID={postID} />
            </div>
          </div>
        </>
      ) : (
        "Loading the Post"
      )}
    </>
  );
}

export default Post;
