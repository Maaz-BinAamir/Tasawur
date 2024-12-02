import { useState, useCallback } from "react";
import axios from "axios";
import NavBar from "./NavBar";

export default function CreatePost() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      if (!image) {
        setError("Please select an image");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("image", image);
      formData.append("description", description);

      const authToken = JSON.parse(localStorage.getItem("authToken"));

      try {
        await axios.post("http://127.0.0.1:8000/api/posts/create/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken.access}`,
          },
        });

        setImage(null);
        setDescription("");
        alert("Post created successfully!");
      } catch (err) {
        setError(
          err.response?.data?.error ||
            "An error occurred while creating the post"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [image, description]
  );

  return (
    <>
      <NavBar />
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="image">Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files && e.target.files[0])}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter your post description"
            className="mt-1"
          />
        </div>
        {error && <p>{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Post"}
        </button>
      </form>
    </>
  );
}
