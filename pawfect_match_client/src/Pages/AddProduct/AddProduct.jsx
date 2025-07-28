import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import axios from "axios";

const AddProduct = () => {
  const { register, handleSubmit, reset } = useForm();
  const axiosSecure = useAxiosSecure();

  const onSubmit = async (data) => {
    try {
      // Upload image to imgbb
      const imageFile = data.image[0];
      const formData = new FormData();
      formData.append("image", imageFile);

      const { data: imgData } = await axios.post(
        `https://api.imgbb.com/1/upload?key=${
          import.meta.env.VITE_IMAGE_UPLOAD_KEY
        }`,
        formData
      );

      if (imgData.success) {
        const imageUrl = imgData.data.url;

        // Prepare product object
        const product = {
          name: data.name,
          category: data.category,
          price: parseFloat(data.price),
          stock: parseInt(data.stock),
          description: data.description,
          image: imageUrl,
        };

        // Send to backend
        const res = await axiosSecure.post("/products", product);
        if (res.data.insertedId) {
          Swal.fire("Success", "Product added successfully!", "success");
          reset();
        }
      }
    } catch (error) {
      console.error("Product Upload Error:", error);
      Swal.fire("Error", "Failed to upload product", "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-base-200 rounded-2xl shadow-xl my-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Add New Product</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Product Name */}
        <input
          type="text"
          placeholder="Product Name"
          {...register("name", { required: true })}
          className="input input-bordered w-full"
        />

        {/* Category Dropdown */}
        <select
          {...register("category", { required: true })}
          className="select select-bordered w-full"
        >
          <option value="">Select Category</option>
          <option value="Food">Pet Food</option>
          <option value="Toys">Toys</option>
          <option value="Medicine">Medicine</option>
          <option value="Accessories">Accessories</option>
          <option value="Other">Other</option>
        </select>

        {/* Price */}
        <input
          type="number"
          step="0.01"
          placeholder="Price (USD)"
          {...register("price", { required: true })}
          className="input input-bordered w-full"
        />

        {/* Stock */}
        <input
          type="number"
          placeholder="Available Stock"
          {...register("stock", { required: true })}
          className="input input-bordered w-full"
        />

        {/* Description */}
        <textarea
          placeholder="Short Description"
          {...register("description", { required: true })}
          className="textarea textarea-bordered w-full"
        ></textarea>

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          {...register("image", { required: true })}
          className="file-input file-input-bordered w-full"
        />

        {/* Submit */}
        <button className="btn btn-primary w-full">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;
