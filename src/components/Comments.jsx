import "../App.css";
import { useState, useEffect } from "react";

function OneComment({ id, username, content, likes, createdAt, onLike, hasLiked, profilePic }) {
  const [currentLikes, setCurrentLikes] = useState(likes);

  const handleLike = () => {
    if (!hasLiked) {
      setCurrentLikes(currentLikes + 1);
      onLike(id); 
    }
  };

  return (
    <div className="comment">
      <div>
      <img
        src={profilePic} className="pfp"
      />
        <strong>{username}</strong>
      </div>
      <div>{content}</div>
      <div>
        <button onClick={handleLike} disabled={hasLiked}>
          {hasLiked ? "Liked" : "Like"}
        </button>{" "}
        {currentLikes} likes
      </div>
      <div>
        <small>{new Date(createdAt).toLocaleString()}</small>
      </div>
      <hr />
    </div>
  );
}

function MakeComment({ onAddComment }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddComment(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="make-comment">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
      />
      <button type="submit">Add Comment</button>
    </form>
  );
}

function Comments({postID}) {
  const getComments = async () => {
    return [
      {
        id: "1",
        body: "I like this drawing",
        username: "Ayesha",
        userId: "1",
        likes: 4,
        createdAt: "2023-08-16T23:00:33.010+02:00",
        profilePic: "https://i.pinimg.com/enabled/236x/49/34/44/493444050c86439c4cd995e5c079bb72.jpg",
      },
      {
        id: "2",
        body: "Beautiful art",
        username: "Imran",
        userId: "2",
        likes: 5,
        createdAt: "2023-08-16T23:00:33.010+02:00",
        profilePic: "https://i.pinimg.com/enabled/236x/49/34/44/493444050c86439c4cd995e5c079bb72.jpg",
      },
    ];
  };
  
  const createComment = async (text) => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      body: text,
      userId: "1",
      likes:0,
      username: "Shasha",
      createdAt: new Date().toISOString(),
    };
  };
  

  const [comments, setComments] = useState([]);
  const [likedComments, setLikedComments] = useState(() => {
    return JSON.parse(localStorage.getItem("likedComments")) || [];
  });

  useEffect(() => {
    getComments().then((data) => setComments(data));
  }, []);

  const addComment = (text) => {
    createComment(text).then((newComment) => {
      setComments([newComment, ...comments]);
    });
  };

  const handleLike = (id) => {
    const updatedLikedComments = [...likedComments, id];
    setLikedComments(updatedLikedComments);
    localStorage.setItem("likedComments", JSON.stringify(updatedLikedComments));
  };

  return (
    <div className="container">
      <h2>Comments</h2>
      <MakeComment onAddComment={addComment} />
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <OneComment
            key={comment.id}
            id={comment.id}
            username={comment.username}
            content={comment.body}
            likes={comment.likes}
            createdAt={comment.createdAt}
            onLike={handleLike}
            hasLiked={likedComments.includes(comment.id)}
            profilePic={comment.profilePic}
          />
        ))
      )}
    </div>
  );
}

export default Comments;
