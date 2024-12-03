import { useState } from "react";
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
    <>
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Login</button>
        {responseMessage && <p>Welcome! {responseMessage}</p>}
      </form>

      <GoogleLoginButton />

      <p>
        If you do not have an account, click here to{" "}
        <button onClick={() => navigate("/signup")}>Sign Up</button>
      </p>
    </>
  );
}

export default LoginForm;
