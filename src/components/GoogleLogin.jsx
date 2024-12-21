import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const clientId =
  "168844986010-vejil6mcti4b0aarthtbgbj0ivf3f2ql.apps.googleusercontent.com";

function GoogleLoginButton() {
  const navigate = useNavigate();

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

      if (profileResponse.data.bio === null) {
        navigate("/edit_profile?signup=True");
      } else {
        navigate("/");
      }
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
    </>
  );
}

export default GoogleLoginButton;
