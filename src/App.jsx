import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import {HomePosts} from "./components/HomePosts";
import Post from "./components/Post";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/SignUpForm" element={<SignUpForm />} />
        <Route path="/HomePosts"  element={<HomePosts />}/> 
        <Route path="/Post/:postID" element={<Post />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/EditProfile" element={<EditProfile />} />
      </Routes>
    </Router>
  );
}
export default App;
