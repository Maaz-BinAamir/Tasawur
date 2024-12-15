import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import z from "zod";
import "../style/EditProfile.css";

const editProfileSchema = z.object({
  first_name: z.string().min(1, "This is a required field"),
  last_name: z.string().min(1, "This is a required field"),
});

const EditProfile = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
  });
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [imageUrl, setImageUrl] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const signup = searchParams.get("signup");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const authToken = JSON.parse(localStorage.getItem("authToken")) || {};
        const response = await axios.get(`http://127.0.0.1:8000/api/profile`, {
          headers: { Authorization: `Bearer ${authToken.access}` },
        });

        setFormData({
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
          bio: response.data.bio || "",
        });
        setImageUrl(response.data.profile_pic);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      editProfileSchema.parse(formData);
      setErrors({});

      const authToken = JSON.parse(localStorage.getItem("authToken")) || {};
      const formDataToSend = new FormData();

      formDataToSend.append("first_name", formData.first_name);
      formDataToSend.append("last_name", formData.last_name);
      formDataToSend.append("bio", formData.bio);

      if (image) {
        formDataToSend.append("profile_picture", image);
      }

      const response = await axios.put(
        "http://127.0.0.1:8000/api/update_user/",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${authToken.access}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("User updated successfully:", response.data);
      if (signup) {
        navigate("/homeposts");
      } else {
        navigate("/profile");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {});
        setErrors(fieldErrors);
      } else if (error.response) {
        console.log(
          error.response.data.error || "An error occurred. Please try again."
        );
      } else {
        console.log("An error occurred. Please try again.");
      }
      console.error("Error while updating:", error);
    }
  };

  return (
    <div className="userLogIncontainer">
      {/* Left panel with User form */}
      <div className="userpanel login-panel">
        <form onSubmit={handleSubmit}>
          <h1>User Details</h1>

          <div className="userLogtxt_field">
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            {errors.first_name && (
              <p className="error-text">{errors.first_name}</p>
            )}
            <label>First Name</label>
            <span></span>
          </div>
          <div className="userLogtxt_field">
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
            {errors.last_name && (
              <p className="error-text">{errors.last_name}</p>
            )}
            <label>Last Name</label>
            <span></span>
          </div>

          <div className="userLogtxt_field">
            <input
              type="text"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              required
            />
            <label>Bio</label>
            <span></span>
          </div>

          {/* Profile Picture Upload */}
          <div className="profile_imgS">
            <input
              type="file"
              name="profile_picture"
              onChange={(e) => {
                setImage(e.target.files[0]);
                setImageUrl(URL.createObjectURL(e.target.files[0])); // Preview image
              }}
            />
            {imageUrl && (
              <img
                className="profile-img-preview"
                src={imageUrl}
                alt="Profile preview"
              />
            )}
          </div>

          <button className="sub">Submit</button>
        </form>
      </div>

      {/* Right panel */}
      <div className="userpanel info-panel">
        <div className="userLogbox-container">
          <div className="userLogbox"></div>
          <div className="userLogbox">
            <span>User Details</span>
          </div>
          <div className="userLogbox"></div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
