import "./app.css";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import GoogleLoginButton from "./components/GoogleLogin";

function App() {
  return (
    <>
      <SignUpForm />
      <LoginForm />
      <GoogleLoginButton />
    </>
  );
}

export default App;
