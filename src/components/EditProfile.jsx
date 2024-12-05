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
  const [imageUrl, setImageUrl] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [errors, setErrors] = useState({});

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
        setImage(response.data.profile_pic);
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
            <h2>User Details</h2>
            <div className="profile-container">
              <label>Profile Picture:</label>
              {image ? (
                <img
                  src={imageUrl ? imageUrl : image}
                  alt="Profile"
                  className="profile-img"
                />
              ) : (
                <p>No profile picture available</p>
              )}
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={(e) => {
                  setImage(e.target.files && e.target.files[0]);
                  setImageUrl(URL.createObjectURL(e.target.files[0]));
                }}
                className="profile-upload"
              />

              <div className="input-group">
                <input
                  type="text"
                  placeholder="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input-field"
                  style={{ color: "black" }}
                />
                {errors.first_name && (
                  <p className="error-text">{errors.first_name}</p>
                )}
              </div>

              <div className="input-group">
                <input
                  type="text"
                  placeholder="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input-field"
                  style={{ color: "black" }}
                />
                {errors.last_name && (
                  <p className="error-text">{errors.last_name}</p>
                )}
              </div>

              <div className="input-group">
                <input
                  type="text"
                  name="bio"
                  placeholder="Bio"
                  style={{ color: "black" }}
                  value={formData.bio}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="call-text">
        <h1>
          Show us your <span>creative</span> side
        </h1>
        <button>Submit</button>
      </div>
    </div>
  );
};

export default EditProfile;
