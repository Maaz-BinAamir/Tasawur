import { useState } from "react";
import "../style/SignUp.css";
import { useNavigate } from "react-router-dom";
import z from "zod";

const signUpSchema = z.object({
  username: z.string().min(1, "This is a required field"),
  email: z.string().email("Invalid format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function SignUpForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

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
        setErrors(fieldErrors);
      } else {
        console.error("Error:", error);
      }
    }
  }

  const toggleLogin = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="wrapper">
    <div className={`login-text ${isExpanded ? "expand" : ""}`}>
      <button className="cta" onClick={toggleLogin}>
        <i
          className={`fas fa-chevron-${isExpanded ? "up" : "down"} fa-1x`}
        ></i>
      </button>
      <div className={`text ${isExpanded ? "show-hide" : ""}`}>
        <form onSubmit={handleSubmit}>
            <h1>Sign Up</h1>
          <div className="input-group">
                <input
                  id="username"
                  type="text"
                  placeholder= "Username"
                  name="username"
              value={formData.username}
              onChange={handleChange}
                  className="input-field"
                  style={{ color: "black" }}
                />
               {errors.username && <p className="error">{errors.username}</p>}

              </div>

              <div className="input-group">
                <input
                    id="email"
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  style={{ color: "black" }}
                />
                 {errors.email && <p className="error">{errors.email}</p>}

              </div>

              <div className="input-group">
                <input
                    id="password"
                  type="password"
                  name="password"
                  placeholder="Password"
                  style={{ color: "black" }}
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                />
            {errors.password && <p className="error">{errors.password}</p>}
              </div>
          
        </form>
        <div className="Logsignup_link">
          Already have an account?{" "}
          <a href="#" onClick={() => navigate("/")}>
            Login
          </a>
        </div>
      </div>
      </div>
      <div className="call-text">
  <h1>
    Show us your <span>creative</span> side
  </h1>
  <div className="SignButt">
  <form onSubmit={handleSubmit}>
    <input type="submit" value="Sign Up" />
  </form>
  </div>
</div>
      </div>

  );
}

export default SignUpForm;
