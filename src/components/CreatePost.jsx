import { useState, useCallback } from "react";
import axios from "axios";
import z from "zod";
import NavBar from "./NavBar";
import "../style/CreatePost.css";
import { useNavigate } from "react-router-dom";

const createPostSchema = z.object({
  image: z.instanceof(File, "An image is required"),
  description: z.string().min(1, "Description is a required field"),
  categories: z.array(z.number()).min(1, "Please select at least one category"),
  agreeToTerms: z.boolean().refine((val) => val, {
    message: "You must agree to the terms before creating a post",
  }),
});

export default function CreatePost() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

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

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setErrors({});

      try {
        const formData = {
          image,
          description,
          categories,
          agreeToTerms,
        };

        createPostSchema.parse(formData);

        const formDataToSend = new FormData();
        formDataToSend.append("image", image);
        formDataToSend.append("description", description);
        formDataToSend.append("categories", categories);

        const authToken = JSON.parse(localStorage.getItem("authToken"));

        await axios.post(
          "http://127.0.0.1:8000/api/posts/create/",
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${authToken.access}`,
            },
          }
        );

        setImage(null);
        setPreviewUrl(null);
        setDescription("");
        setCategories([]);
        setAgreeToTerms(false);

        alert("Post created successfully!");
        navigate("/home");
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors = error.errors.reduce((acc, err) => {
            acc[err.path[0]] = err.message;
            return acc;
          }, {});
          setErrors(fieldErrors);
        } else {
          setErrors({ general: "An error occurred while creating the post" });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [image, description, categories, agreeToTerms, navigate]
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <>
      <NavBar />
      <div className="create-post-wrapper">
        <form onSubmit={handleSubmit}>
          <div className="image-container">
            <label className="image-label" htmlFor="image">
              Image
            </label>
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="image-preview" />
            )}
            {errors.image && <p className="error-text">{errors.image}</p>}
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div>
            <label className="description-label" htmlFor="description">
              Description
            </label>
            <textarea
              className="description"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter your post description"
            />
            {errors.description && (
              <p className="error-text">{errors.description}</p>
            )}
          </div>

          {/* Categories */}
          <div className="categories">
            <label className="category-label">Categories</label>
            <div className="categories">
              {categoryOptions.map((category) => (
                <div key={category.id}>
                  <input
                    type="checkbox"
                    id={category.id}
                    value={category.id}
                    checked={categories.includes(category.id)}
                    onChange={(e) => {
                      if (categories.includes(parseInt(e.target.value))) {
                        setCategories(
                          categories.filter(
                            (c) => c !== parseInt(e.target.value)
                          )
                        );
                      } else {
                        setCategories([
                          ...categories,
                          parseInt(e.target.value),
                        ]);
                      }
                    }}
                  />
                  <label htmlFor={category.id}>{category.name}</label>
                </div>
              ))}
            </div>
            {errors.categories && (
              <p className="error-text">{errors.categories}</p>
            )}
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
                I agree that my content does not have human portraits or
                sculptures, and if any such content is found, it will be removed
                without warning.
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="error-text">{errors.agreeToTerms}</p>
            )}
          </div>

          {errors.general && <p className="error-text">{errors.general}</p>}

          <button className="create-button" type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Post"}
          </button>
        </form>
      </div>
    </>
  );
}
