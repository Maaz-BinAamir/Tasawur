import { useState } from "react";
import { useNavigate } from "react-router-dom";
import z from "zod";

const signUpSchema=z.object({
  username: z.string().min(1, "This is a required field"),
  email: z.string().email("Invalid format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

function SignUpForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    console.log(JSON.stringify(formData));
    try {
      signUpSchema.parse(formData);
      setErrors({});
      const response = await fetch("http://127.0.0.1:8000/api/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log(data);
      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {});
        setErrors(fieldErrors);}
      else{
      console.error("Error:", error);
    }
  }}

  return (
    <div className="LogIncontainer">
      {/*left panel with sign info */}
      <div className="panel login-panel">
        <form onSubmit={handleSubmit}>
          <h1>Sign Up</h1>
          <div className="Logtxt_field">
            <label>Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <p className="error">{errors.username}</p>}
          </div>
          <div className="Logtxt_field">
            <label>Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>
          <div className="Logtxt_field">
            <label>Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          <input type="submit" value="Sign Up" />        </form>
        <div className="Logsignup_link">
          Already have an account?{" "}
          <a href="#" onClick={() => navigate("/")}>
            Login
          </a>
        </div>
      </div>
      {/* Right panel */}
      <div className="panel info-panel">
  
  <div className="Logbox-container">
    <div className="Logbox">
  
    </div>
    <div className="Logbox">
      <span>Sign Up</span>
    </div>
    <div className="Logbox">
     
    </div>
  </div>
</div>
    </div>
  );
}

export default SignUpForm;
