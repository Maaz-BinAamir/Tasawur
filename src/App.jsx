import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import { HomePosts } from "./components/HomePosts";
import Post from "./components/Post";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import CreatePost from "./components/CreatePost";
import ChatApp from "./components/ChatApp";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/" element={<HomePosts />} />
        <Route path="/search" element={<HomePosts />} />
        <Route path="/saved_posts" element={<HomePosts />} />
        <Route path="/post/:postID" element={<Post />} />
        <Route path="/create_post" element={<CreatePost />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit_profile" element={<EditProfile />} />
        <Route path="/chat" element={<ChatApp />} />
      </Routes>
    </Router>
  );
}
export default App;
