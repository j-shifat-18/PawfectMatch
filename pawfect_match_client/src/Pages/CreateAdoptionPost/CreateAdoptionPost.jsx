import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useAuth from "../../Hooks/useAuth";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";

const CreateAdoptionPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const {
    data: pet = {},
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["pet", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/pets/${id}`);
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const images = data.extraImages;
      const imageUrls = [];

      for (let i = 0; i < images.length; i++) {
        const formData = new FormData();
        formData.append("image", images[i]);
        const res = await fetch(
          `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_UPLOAD_KEY}`,
          {
            method: "POST",
            body: formData,
          }
        );
        const result = await res.json();
        imageUrls.push(result.data.url);
      }

      const adoptionPost = {
        title: data.title,
        description: data.description,
        images: imageUrls,
        petId: pet._id,
        ownerEmail: user.email,
        createdAt: new Date(),
        petInfo: pet,
      };

      await axiosSecure.post("/adoptionPosts", adoptionPost);
      await axiosSecure.patch(`/pets/${pet._id}/adoption`, {
        isListedForAdoption: true,
      });

      Swal.fire("Success", "Adoption post created!", "success");
      navigate("/dashboard/my-pets");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  if (isLoading) return <p className="text-center p-10">Loading...</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-10"
    >
      <h2 className="text-3xl font-bold text-center text-primary mb-6">
        Create Adoption Post
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Readonly Pet Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Pet Name</label>
            <input
              type="text"
              readOnly
              value={pet.name || ""}
              className="input input-bordered w-full bg-gray-100"
            />
          </div>
          <div>
            <label className="label">Breed</label>
            <input
              type="text"
              readOnly
              value={pet.breed || ""}
              className="input input-bordered w-full bg-gray-100"
            />
          </div>
          <div>
            <label className="label">Age</label>
            <input
              type="text"
              readOnly
              value={pet.age || ""}
              className="input input-bordered w-full bg-gray-100"
            />
          </div>
          <div>
            <label className="label">Gender</label>
            <input
              type="text"
              readOnly
              value={pet.gender || ""}
              className="input input-bordered w-full bg-gray-100"
            />
          </div>
        </div>

        {/* Post Title */}
        <div>
          <label className="label">Title</label>
          <input
            {...register("title", { required: true })}
            type="text"
            placeholder="Give your post a catchy title"
            className="input input-bordered w-full"
          />
          {errors.title && <p className="text-red-500">Title is required</p>}
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea
            {...register("description", { required: true })}
            rows={4}
            className="textarea textarea-bordered w-full"
            placeholder="Share more about your pet, why you're putting up for adoption, etc."
          ></textarea>
          {errors.description && (
            <p className="text-red-500">Description is required</p>
          )}
        </div>

        {/* Extra Images */}
        <div>
          <label className="label">Upload Extra Pictures</label>
          <input
            {...register("extraImages")}
            type="file"
            multiple
            className="file-input file-input-bordered w-full"
          />
        </div>

        <button className="btn btn-primary w-full gap-2">
          <UploadCloud className="w-5 h-5" /> Submit Post
        </button>
      </form>
    </motion.div>
  );
};

export default CreateAdoptionPost;
