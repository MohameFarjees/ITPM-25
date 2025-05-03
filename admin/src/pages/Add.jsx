import { useState } from "react";
import { assets } from "../assets/assets";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState([]);
  const [bestseller, setBestseller] = useState(false);

  // Image upload handling
  const handleImageUpload = (e, imageNumber) => {
    const file = e.target.files[0];
    if (file) {
      // Update the image state
      switch (imageNumber) {
        case 1:
          setImage1(file);
          break;
        case 2:
          setImage2(file);
          break;
        case 3:
          setImage3(file);
          break;
        case 4:
          setImage4(file);
          break;
        default:
          break;
      }
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("price", price);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("bestseller", bestseller);

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setName("");
        setDescription("");
        setCategory("Men");
        setSubCategory("Topwear");
        setPrice("");
        setSizes([]);
        setBestseller(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Helper for image selection highlight
  const getImageFrameClass = () => {
    return "w-20 h-20 object-cover border border-gray-200 rounded transition-all hover:shadow-md";
  };

  return (
    <div className="flex flex-col w-full">
      {/* Form Container */}
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col w-full items-start gap-3"
      >
        <h2 className="text-2xl font-semibold mb-2">Add New Product</h2>

        <div className="w-full">
          <p className="mb-2">Upload Image</p>

          <div className="flex gap-2">
            <div>
              <label htmlFor="image1" className="cursor-pointer">
                <img
                  src={
                    !image1 ? assets.upload_area : URL.createObjectURL(image1)
                  }
                  className={getImageFrameClass()}
                  alt="Upload Area"
                />
              </label>
              <input
                onChange={(e) => handleImageUpload(e, 1)}
                type="file"
                id="image1"
                hidden
              />
            </div>

            <div>
              <label htmlFor="image2" className="cursor-pointer">
                <img
                  src={
                    !image2 ? assets.upload_area : URL.createObjectURL(image2)
                  }
                  className={getImageFrameClass()}
                  alt="Upload Area"
                />
              </label>
              <input
                onChange={(e) => handleImageUpload(e, 2)}
                type="file"
                id="image2"
                hidden
              />
            </div>

            <div>
              <label htmlFor="image3" className="cursor-pointer">
                <img
                  src={
                    !image3 ? assets.upload_area : URL.createObjectURL(image3)
                  }
                  className={getImageFrameClass()}
                  alt="Upload Area"
                />
              </label>
              <input
                onChange={(e) => handleImageUpload(e, 3)}
                type="file"
                id="image3"
                hidden
              />
            </div>

            <div>
              <label htmlFor="image4" className="cursor-pointer">
                <img
                  src={
                    !image4 ? assets.upload_area : URL.createObjectURL(image4)
                  }
                  className={getImageFrameClass()}
                  alt="Upload Area"
                />
              </label>
              <input
                onChange={(e) => handleImageUpload(e, 4)}
                type="file"
                id="image4"
                hidden
              />
            </div>
          </div>
        </div>

        <div className="w-full">
          <p className="mb-2">Product Name</p>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            className="w-full max-w-[500px] px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Type product name here"
            required
          />
        </div>

        <div className="w-full">
          <p className="mb-2">Product Description</p>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            type="text"
            className="w-full max-w-[500px] px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Type product description here"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
          <div>
            <p className="mb-2">Product Category</p>
            <select
              onChange={(e) => setCategory(e.target.value)}
              value={category}
              className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
          </div>

          <div>
            <p className="mb-2">Sub Category</p>
            <select
              onChange={(e) => setSubCategory(e.target.value)}
              value={subCategory}
              className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Topwear">Topwear</option>
              <option value="Bottomwear">Bottomwear</option>
              <option value="Winterwear">Winterwear</option>
            </select>
          </div>

          <div>
            <p className="mb-2">Product Price</p>
            <input
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              type="number"
              className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500 transition-colors sm:w-[120px]"
              placeholder="25"
            />
          </div>
        </div>

        <div>
          <p className="mb-2">Product Sizes</p>
          <div className="flex gap-3">
            {["S", "M", "L", "XL", "XXL"].map((size) => (
              <div
                key={size}
                onClick={() =>
                  setSizes((prev) =>
                    prev.includes(size)
                      ? prev.filter((item) => item !== size)
                      : [...prev, size]
                  )
                }
                className="transition-all duration-200"
              >
                <p
                  className={`${
                    sizes.includes(size)
                      ? "bg-pink-100 shadow-sm"
                      : "bg-slate-200"
                  } px-3 py-1 cursor-pointer rounded hover:shadow-md transition-all`}
                >
                  {size}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <input
            onChange={() => setBestseller((prev) => !prev)}
            checked={bestseller}
            type="checkbox"
            id="bestseller"
            className="accent-pink-500"
          />
          <label className="cursor-pointer" htmlFor="bestseller">
            Add to Bestseller
          </label>
        </div>

        <button
          type="submit"
          className="w-28 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors mt-2"
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default Add;