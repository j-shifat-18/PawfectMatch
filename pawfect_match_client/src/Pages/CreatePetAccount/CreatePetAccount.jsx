import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FaPaw, FaMagic } from "react-icons/fa";
import Swal from "sweetalert2";
import useAuth from "../../Hooks/useAuth";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
const imageHostingKey = import.meta.env.VITE_IMAGE_UPLOAD_KEY;
const imageHostingUrl = `https://api.imgbb.com/1/upload?key=${imageHostingKey}`;

// Image compression function
const compressImage = (file) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 800px width/height)
      const maxSize = 800;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, 'image/jpeg', 0.8); // 80% quality
    };
    
    img.src = URL.createObjectURL(file);
  });
};

const CreatePetAccount = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm();

  const { mutateAsync } = useMutation({
    mutationFn: async (petData) => {
      const res = await axiosSecure.post("/pets", petData);
      return res.data;
    },
  });

  const autoDetectPetInfo = async () => {
    const imageFile = watch("image")?.[0];
    if (!imageFile) {
      Swal.fire("Error", "Please upload an image first", "error");
      return;
    }

    setIsDetecting(true);
    try {
      // Compress and resize image before sending
      const compressedImage = await compressImage(imageFile);
      
      // Convert image to base64
      const base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          resolve(base64);
        };
        reader.readAsDataURL(compressedImage);
      });

      // Call server endpoint for AI analysis
      const response = await axiosSecure.post("/ai/auto-detect-pet", {
        imageData: base64Image,
        mimeType: compressedImage.type
      });

      if (response.data.success) {
        const petInfo = response.data.data;
        
        // Update form fields with detected information
        if (petInfo.type) setValue("type", petInfo.type);
        if (petInfo.breed) setValue("breed", petInfo.breed);
        if (petInfo.color) setValue("color", petInfo.color);
        if (petInfo.gender) setValue("gender", petInfo.gender);
        if (petInfo.age) setValue("age", petInfo.age);
        if (petInfo.weight) setValue("weight", petInfo.weight);
        
        // Additional fields for enhanced AI detection
        if (petInfo.grooming_needs) setValue("grooming_needs", petInfo.grooming_needs);
        if (petInfo.exercise_needs) setValue("exercise_needs", petInfo.exercise_needs);
        if (petInfo.noise_level) setValue("noise_level", petInfo.noise_level);

        Swal.fire("Success", "Pet information detected successfully!", "success");
      } else {
        throw new Error(response.data.message || "Detection failed");
      }
    } catch (error) {
      console.error("Auto detect error:", error);
      Swal.fire("Error", "Failed to detect pet information. Please fill manually.", "error");
    } finally {
      setIsDetecting(false);
    }
  };

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
        ownerEmail: user.email,
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

        // New fields
        species: data.species,
        temperament: data.temperament,
        good_with_kids: data.good_with_kids === "true",
        grooming_needs: data.grooming_needs,
        exercise_needs: data.exercise_needs,
        trained: data.trained === "true",
        noise_level: data.noise_level,
        available_in: data.available_in,
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label className="label">Name</label>
          <input
            type="text"
            {...register("name", { required: "Pet name is required" })}
            className="input input-bordered w-full"
          />
          {errors.name && (
            <span className="text-error text-sm">{errors.name.message}</span>
          )}
        </div>

        <div>
          <label className="label">Type</label>
          <input
            type="text"
            placeholder="Dog, Cat, Rabbit..."
            {...register("type", { required: "Type is required" })}
            className="input input-bordered w-full"
          />
          {errors.type && (
            <span className="text-error text-sm">{errors.type.message}</span>
          )}
        </div>

        <div>
          <label className="label">Breed</label>
          <input
            type="text"
            {...register("breed", { required: "Breed is required" })}
            className="input input-bordered w-full"
          />
          {errors.breed && (
            <span className="text-error text-sm">{errors.breed.message}</span>
          )}
        </div>

        <div>
          <label className="label">Gender</label>
          <select
            {...register("gender", { required: true })}
            className="select select-bordered w-full"
          >
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
          <input
            type="text"
            {...register("color")}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="label">Weight</label>
          <input
            type="text"
            {...register("weight")}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="label">Vaccinated?</label>
          <select
            {...register("vaccinated", { required: true })}
            className="select select-bordered w-full"
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <label className="label">Species</label>
          <input
            type="text"
            placeholder="e.g., dog, cat"
            {...register("species", { required: true })}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="label">Temperament</label>
          <input
            type="text"
            placeholder="e.g., calm, energetic"
            {...register("temperament")}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="label">Good with Kids?</label>
          <select
            {...register("good_with_kids", { required: true })}
            className="select select-bordered w-full"
          >
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div>
          <label className="label">Grooming Needs</label>
          <select
            {...register("grooming_needs")}
            className="select select-bordered w-full"
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="label">Exercise Needs</label>
          <select
            {...register("exercise_needs")}
            className="select select-bordered w-full"
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="label">Trained?</label>
          <select
            {...register("trained")}
            className="select select-bordered w-full"
          >
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div>
          <label className="label">Noise Level</label>
          <select
            {...register("noise_level")}
            className="select select-bordered w-full"
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="label">Available In</label>
          <input
            type="text"
            placeholder="e.g., Dhaka"
            {...register("available_in", { required: true })}
            className="input input-bordered w-full"
          />
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

<div className="md:col-span-2 flex flex-col md:flex-row gap-2">
  <button 
    type="button"
    onClick={autoDetectPetInfo}
    disabled={isDetecting || !watch("image")?.[0]}
    className="btn btn-secondary w-full md:flex-1"
  >
    <FaMagic className="mr-2" />
    {isDetecting ? "Detecting..." : "Auto Detect"}
  </button>
  <button
    className="btn btn-primary w-full md:flex-1"
    type="submit"
    disabled={isSubmitting}
  >
    {isSubmitting ? "Submitting..." : "Create Pet Account"}
  </button>
</div>

      </form>
    </motion.div>
  );
};

export default CreatePetAccount;
