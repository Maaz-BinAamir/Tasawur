import { useState } from "react";
import "../style/logIn.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "./GoogleLogin";

function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [responseMessage, setResponseMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Login Successful:", response.data);

      localStorage.setItem("authToken", JSON.stringify(response.data));

      const profileResponse = await axios.get(
        "http://localhost:8000/api/profile/",
        {
          headers: {
            Authorization: `Bearer ${response.data.access}`,
          },
        }
      );

      console.log("User Profile:", profileResponse.data);
      setResponseMessage(`${profileResponse.data.username}`);

      localStorage.setItem("userID", profileResponse.data.id);

      if (profileResponse.data.bio === null) {
        navigate("/edit_profile?signup=True");
      } else {
        navigate("/homeposts");
      }
    } catch (error) {
      if (error.response) {
        setResponseMessage(
          error.response.data.error || "An error occurred. Please try again."
        );
      } else {
        setResponseMessage("An error occurred. Please try again.");
      }
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="LogIncontainer">
      {/* Left panel with login form */}
      <div className="panel login-panel">
        <form onSubmit={handleSubmit}>
          <h1>Login</h1>
          <div className="Logtxt_field">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <label>Username</label>
            <span></span>
          </div>
          <div className="Logtxt_field">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label>Password</label>
            <span></span>
          </div>
          <input type="submit" value="Login" />
          {responseMessage && (
            <p className="responseMessage">{responseMessage}</p>
          )}
        </form>

        <div className="logOr">or</div>

        <div>
          <GoogleLoginButton />
        </div>

        <div className="Logsignup_link">
          Don&apos;t have an account?{" "}
          <a href="#" onClick={() => navigate("/SignUpForm")}>
            Sign Up
          </a>
        </div>
      </div>

      {/* Right panel */}
      <div className="panel info-panel">
        <div className="Logbox-container">
          <div className="Logbox"></div>
          <div className="Logbox">
            <span>Log In</span>
          </div>
          <div className="Logbox"></div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
