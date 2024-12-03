import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function EditProfile() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
  });
  const [image, setImage] = useState(null);
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
      if (error.response) {
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
    <>
      <form onSubmit={handleSubmit}>
        <h2>User Details</h2>
        <div>
          <label>Profile Picture:</label>
          {image ? (
            <img
              src={imageUrl ? imageUrl : image}
              alt="Profile"
              style={{ width: "150px", height: "150px", borderRadius: "50%" }}
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
          />
        </div>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Bio:</label>
          <input
            type="text"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default EditProfile;
