import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./app.css";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import GoogleLoginButton from "./components/GoogleLogin";

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
