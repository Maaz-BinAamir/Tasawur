import "../App.css";
import NavBar from "./NavBar.jsx";
import {
  useNavigate
} from "react-router-dom";

const links = [
  {url: "https://i.pinimg.com/enabled/236x/49/34/44/493444050c86439c4cd995e5c079bb72.jpg", username:"Ayesha", id:0 ,likes:20, createdAt: "2023-08-16", profilePic: "https://i.pinimg.com/enabled/236x/49/34/44/493444050c86439c4cd995e5c079bb72.jpg"},
  {url:"https://i.pinimg.com/enabled/236x/38/ec/33/38ec33dcc214c24122e30f2194d73bb1.jpg", username:"Maheen", id:1, likes:40, createdAt: "2023-08-16", profilePic: "https://i.pinimg.com/enabled/236x/49/34/44/493444050c86439c4cd995e5c079bb72.jpg"},
];


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
            src={link.url} alt={`Post ${i + 1}`} key={i} onClick={() => openPost(i)}  id={link.id}
          />
        ))}
      </div>
    </>
  );
}

export {HomePosts, links};

