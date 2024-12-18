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
    preferences: [],
  });
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const signup = searchParams.get("signup");

  const categoryOptions = [
    { id: 1, name: "Sketching" },
    { id: 2, name: "Painting" },
    { id: 3, name: "Digital Art" },
    { id: 4, name: "Journaling" },
    { id: 5, name: "Photography" },
    { id: 6, name: "Doodling" },
    { id: 7, name: "Sculpting" },
    { id: 8, name: "Crocheting" },
  ];

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
          preferences:
            response.data.preferences.map((pref) => pref.category_id) || [],
        });
        setPreviewUrl(response.data.profile_pic);
        console.log(response.data.preferences);
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

  const handlePreferencesChange = (id) => {
    setFormData((prevData) => {
      const isSelected = prevData.preferences.includes(id);
      return {
        ...prevData,
        preferences: isSelected
          ? prevData.preferences.filter((pref) => pref !== id)
          : [...prevData.preferences, id],
      };
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
      formDataToSend.append("preferences", formData.preferences);

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
        navigate("/home");
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
      <div className="userpanel login-panel">
        <form onSubmit={handleSubmit}>
          <h1>Edit Profile</h1>

          {/* Profile Picture Upload */}
          <div className="profile_imgS">
            {previewUrl && (
              <img
                className="profile-img-preview"
                src={previewUrl}
                alt="Profile preview"
              />
            )}
            <input
              type="file"
              name="profile_picture"
              onChange={(e) => {
                setImage(e.target.files[0]);
                setPreviewUrl(URL.createObjectURL(e.target.files[0]));
              }}
            />
          </div>

          {/* First Name */}
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
          </div>

          {/* Last Name */}
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
          </div>

          {/* Bio */}
          <div className="userLogtxt_field">
            <input
              type="text"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              required
            />
            <label>Bio</label>
          </div>

          {/* Preferences */}
          <div className="category-preferences">
            <h3>Select Preferences</h3>
            <div className="categories">
              {categoryOptions.map((category) => (
                <label key={category.id} className="category-option">
                  <input
                    type="checkbox"
                    checked={formData.preferences.includes(category.id)}
                    onChange={() => handlePreferencesChange(category.id)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          <button className="sub">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
