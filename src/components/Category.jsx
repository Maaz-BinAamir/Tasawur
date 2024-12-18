import { useState} from "react";
import z from "zod";
import {useNavigate} from "react-router-dom"

const createPostSchema = z.object({
  categories: z.array(z.string()).min(1, "Please select at least one category")
});

function Category(){
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const categoryOptions = [
    "Sketching",
    "Painting",
    "Digital Art",
    "Journaling",
    "Photography",
    "Doodling",
    "Sculpting",
    "Crocheting",
  ];

 const openHome = () => {
    navigate(`/homeposts`);
  };

  return (
  <>
  <p>Choose a few categories you are interested in</p>
  <div>
  {/* Categories */}
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
          onChange={(e) => {
            if (categories.includes(e.target.value)) {
              setCategories(
                categories.filter((c) => c !== e.target.value)
              );
            } else {
              setCategories([...categories, e.target.value]);
            }
          }}
        />
        <label htmlFor={category}>{category}</label>
      </div>
    ))}
  </div>
  {errors.categories && (
    <p className="error-text">{errors.categories}</p>
  )}
</div>
</div>
<button onClick={openHome} >Next</button>
</>
);
}

export default Category;