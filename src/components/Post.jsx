import "../App.css";
import NavBar from "./NavBar.jsx";
import { useParams } from "react-router-dom";
import { useState} from "react";
import { links } from "./HomePosts.jsx";
import Comments from "./Comments.jsx";

function Post() {
  const { postID } = useParams(); 

  const posts = links[parseInt(postID)] || "";  

  const [currentLikes, setCurrentLikes] = useState(posts ? posts.likes : 0);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = () => {
    if (!hasLiked) {
      setCurrentLikes(currentLikes + 1);
      setHasLiked(true);
    }
  };

   return (
    <>
      <NavBar />
     <div>
        <h2></h2>
       {posts ? (
        <>
        <div>
          <img
          src={posts.profilePic} className="pfp"
          />
            <strong>{posts.username}</strong>
        </div>
         <div>
           <img src={posts.url} alt={`Post ${postID}`} style={{ width: "15%", height: "auto" }} />
         </div>
         <div>
            <div>
              <button onClick={handleLike} disabled={hasLiked}>
              {hasLiked ? "Liked" : "Like"}
              </button>{" "}
              {currentLikes}
            </div>
            <h2>{posts.createdAt}</h2>
            <Comments postID={postID} />
         </div>
         </>
       ) : (
         <p>Post not found.</p> 
       )}
     </div>
     </>
   );
 }

export default Post;
