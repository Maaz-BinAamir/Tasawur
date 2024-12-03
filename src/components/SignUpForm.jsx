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
    <>
      <form onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <p style={{ color: "red" }}>{errors.username}</p>}
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
           {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
           {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
        </div>
        <button type="submit">Sign Up</button>
      </form>

      <p>
        Already Have an account? Click here to{" "}
        <button onClick={() => navigate("/")}>Login</button>
      </p>
    </>
  );
}

export default SignUpForm;
