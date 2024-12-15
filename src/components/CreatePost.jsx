import { useState, useCallback } from "react";
import axios from "axios";
import NavBar from "./NavBar";
import "../style/CreatePost.css";

export default function CreatePost() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const categoryOptions = ["Sketching", "Painting", "Digital Art", "Journaling", "Photography", "Doodling", "Sculpting", "Crocheting"];


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

      if (!categories.length) {
        setError("Please select at least one category");
        setIsLoading(false);
        return;
      }

      if (!agreeToTerms) {
        setError("You must agree to the terms before creating a post");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("image", image);
      formData.append("description", description);
      formData.append("categories", JSON.stringify(categories));


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
        setCategories([]);
        setAgreeToTerms(false);

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
    [image, description, categories, agreeToTerms]
  );

  return (
    <>
      <NavBar />
      <div className="create-post-wrapper">
      <form  onSubmit={handleSubmit}>
        <div className="image-container">
          <label className="image-label" htmlFor="image">Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files && e.target.files[0])}
          />
        </div>
        <div > 
          <label className="description-label" htmlFor="description">Description</label>
          <textarea className="description"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter your post description"
          />
        </div>
        <div className="categories">
          <label className="category-label">Categories</label>
          <div className="categories">
            {categoryOptions.map((category) => (
              <div key={category}>
                <input
                  type="checkbox"
                  id={category}
                  value={category}
                  checked={categories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                <label htmlFor={category}>{category}</label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="terms">Terms and conditions</h3>
          <div className="term-statement">
          <input
            type="checkbox"
            id="agreeToTerms"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
          />
          <label htmlFor="agreeToTerms">
            I agree that my content does not have human portraits or scultpures and if any such content is found on my page, it will be removed without warning.
          </label>
          </div>
        </div>
        {error && <p>{error}</p>}
        <button className="create-button" type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Post"}
        </button>
      </form>
      </div>
    </>
  );
}
