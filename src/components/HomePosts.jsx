import { useState, useEffect, useCallback, useRef } from "react";
import "../style/HomePosts.css";
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

  // Check if we're on the home page
  const isHomePage = location.pathname === "/home";

  const fetchPosts = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (!hasMore) return;

    setLoaded(false);
    const authToken = JSON.parse(localStorage.getItem("authToken"));

    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";

    try {
      const url = `http://127.0.0.1:8000/api/homeposts/?page=${page}&q=${encodeURIComponent(
        query
      )}&category=${encodeURIComponent(category)}`;

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
    }
  }, [page, searchParams, hasMore, isHomePage]);

  // Reset page and posts when search params change
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(isHomePage);
  }, [searchParams, isHomePage]);

  // Fetch posts when component mounts or page/search changes
  useEffect(() => {
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
      {!loaded && posts.length === 0 && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}

      {/* No Posts Found State */}
      {posts.length === 0 && loaded && (
        <div className="no-posts-container">
          <p>No Posts Found</p>
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
