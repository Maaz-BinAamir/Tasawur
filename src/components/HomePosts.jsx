import { useState, useEffect, useCallback, useRef } from "react";
import "../style/HomePosts.css";
import Loader from "./Utility/Loader.jsx";
import NavBar from "./NavBar.jsx";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";

function HomePosts() {
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Ref to track the last image for intersection observer
  const lastPostElementRef = useRef();

  // Infinite scroll observer
  const observer = useRef();

  // Check if we're on the home page or saved posts page
  const isHomePage = location.pathname === "/";
  const isSavedPostsPage = location.pathname === "/saved_posts";

  const fetchPosts = useCallback(async () => {
    if (!hasMore && !isSavedPostsPage) return;

    setLoaded(false);
    const authToken = JSON.parse(localStorage.getItem("authToken"));

    if (!authToken) {
      navigate("/login");
      return;
    }

    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";

    try {
      const url = isHomePage
        ? `http://127.0.0.1:8000/api/homeposts/?page=${page}&q=${encodeURIComponent(
            query
          )}&category=${encodeURIComponent(category)}`
        : `http://127.0.0.1:8000/api/saved_posts/`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${authToken.access}`,
        },
      });

      // Determine if there are more posts
      const newPosts = response.data;

      // Update posts and hasMore more precisely
      setPosts((prevPosts) =>
        page === 1 ? newPosts : [...prevPosts, ...newPosts]
      );

      // Set hasMore based on returned posts length
      setHasMore(isHomePage ? newPosts.length > 0 : false);
      setLoaded(true);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoaded(true);
      setHasMore(false);

      if (error.response) {
        if (error.response.status === 401) {
          console.error("Unauthorized: Please log in again.");
          navigate("/login");
        } else {
          console.error(
            "Error fetching posts:",
            error.response.status,
            error.response.data
          );
        }
      } else {
        console.error("Network or other error:", error.message);
      }
    }
  }, [page, searchParams, hasMore, isHomePage, isSavedPostsPage, navigate]);

  // Reset page and posts when search params change
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(isHomePage);
  }, [searchParams, isHomePage, isSavedPostsPage]);

  // Fetch posts when component mounts or page/search changes
  useEffect(() => {
    if (page === 1) {
      setPosts([]);
    }
    fetchPosts();
  }, [page, searchParams, fetchPosts]);

  // Intersection Observer for infinite scroll (only on home page)
  useEffect(() => {
    // Disconnect existing observer
    if (observer.current) observer.current.disconnect();

    // Only create observer if on home page and we want more posts
    if (!isHomePage || !hasMore) return;

    const observerCallback = (entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    observer.current = new IntersectionObserver(observerCallback, {
      rootMargin: "200px",
    });

    if (lastPostElementRef.current) {
      observer.current.observe(lastPostElementRef.current);
    }

    // Cleanup
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, isHomePage, posts.length]);

  const openPost = (postId) => {
    navigate(`/post/${postId}`);
  };

  return (
    <>
      <NavBar />

      {/* Loading Spinner */}
      {!loaded && posts.length === 0 && <Loader />}

      {/* No Posts Found State */}
      {posts.length === 0 && loaded && (
        <div className="no-posts-container">
          <p>{isSavedPostsPage ? "No Saved Posts Found" : "No Posts Found"}</p>
        </div>
      )}

      <div className="container">
        {posts.map((post, i) => (
          <img
            src={post.image}
            alt={`Post ${i + 1}`}
            key={post.id || i}
            onClick={() => openPost(post.id)}
            id={post.id}
            // Attach ref to the last image
            ref={i === posts.length - 1 ? lastPostElementRef : null}
          />
        ))}
      </div>
    </>
  );
}

export { HomePosts };
