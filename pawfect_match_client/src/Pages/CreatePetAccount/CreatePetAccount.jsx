// CreatePetAccount.jsx
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FaPaw } from "react-icons/fa";
import Swal from "sweetalert2";
import useAuth from "../../Hooks/useAuth";
import useAxiosSecure from "../../Hooks/useAxiosSecure";

const imageHostingKey = import.meta.env.VITE_IMAGE_UPLOAD_KEY;
const imageHostingUrl = `https://api.imgbb.com/1/upload?key=${imageHostingKey}`;

const CreatePetAccount = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const { mutateAsync } = useMutation({
    mutationFn: async (petData) => {
      const res = await axiosSecure.post("/pets", petData);
      return res.data;
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Upload image to imgbb
      const formData = new FormData();
      formData.append("image", data.image[0]);
      const imageRes = await fetch(imageHostingUrl, {
        method: "POST",
        body: formData,
      });
      const imgData = await imageRes.json();
      if (!imgData.success) throw new Error("Image upload failed");

      const petData = {
        ownerEmail:user.email,
        ownerId: user.uid,
        name: data.name,
        type: data.type,
        breed: data.breed,
        gender: data.gender,
        age: parseInt(data.age),
        color: data.color,
        weight: data.weight,
        vaccinated: data.vaccinated === "yes",
        images: [imgData.data.url],
        isAdopted: false,
        isListedForAdoption: false,
        createdAt: new Date(),
      };

      await mutateAsync(petData);
      reset();
      Swal.fire("Success", "Pet profile created!", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-6 bg-base-200 rounded-2xl shadow-xl"
    >
      <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <FaPaw className="text-primary" /> Create Pet Account
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Name</label>
          <input
            type="text"
            {...register("name", { required: "Pet name is required" })}
            className="input input-bordered w-full"
          />
          {errors.name && <span className="text-error text-sm">{errors.name.message}</span>}
        </div>

        <div>
          <label className="label">Type</label>
          <input
            type="text"
            placeholder="Dog, Cat, Rabbit..."
            {...register("type", { required: "Type is required" })}
            className="input input-bordered w-full"
          />
          {errors.type && <span className="text-error text-sm">{errors.type.message}</span>}
        </div>

        <div>
          <label className="label">Breed</label>
          <input
            type="text"
            {...register("breed", { required: "Breed is required" })}
            className="input input-bordered w-full"
          />
          {errors.breed && <span className="text-error text-sm">{errors.breed.message}</span>}
        </div>

        <div>
          <label className="label">Gender</label>
          <select {...register("gender", { required: true })} className="select select-bordered w-full">
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label className="label">Age (in years)</label>
          <input
            type="number"
            {...register("age", { required: true, min: 0 })}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="label">Color</label>
          <input type="text" {...register("color")} className="input input-bordered w-full" />
        </div>

        <div>
          <label className="label">Weight</label>
          <input type="text" {...register("weight")} className="input input-bordered w-full" />
        </div>

        <div>
          <label className="label">Vaccinated?</label>
          <select {...register("vaccinated", { required: true })} className="select select-bordered w-full">
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label">Pet Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            {...register("image", { required: true })}
            className="file-input file-input-bordered w-full"
          />
        </div>

        <div className="md:col-span-2 flex justify-center">
          <button className="btn btn-primary w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Create Pet Account"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreatePetAccount;
