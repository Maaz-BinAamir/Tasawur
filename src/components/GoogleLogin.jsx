import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { useState } from "react";

const clientId =
  "168844986010-vejil6mcti4b0aarthtbgbj0ivf3f2ql.apps.googleusercontent.com";

function GoogleLoginButton() {
  const [ResponseMessage, setResponseMessage] = useState("");

  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/google/",
        {
          access_token: token,
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
      setResponseMessage(`Welcome! ${profileResponse.data.username}`);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleError = () => {
    console.error("Google Login Failed");
  };

  return (
    <>
      <GoogleOAuthProvider clientId={clientId}>
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      </GoogleOAuthProvider>
      {ResponseMessage && <p>{ResponseMessage}</p>}
    </>
  );
}

export default GoogleLoginButton;
