import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useAuth from "../../Hooks/useAuth";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useState } from "react";
import Swal from "sweetalert2";
import { FaDog } from "react-icons/fa";

const UserProfile = () => {
  const { email: profileEmail } = useParams();
  const { user } = useAuth();
  const isOwnProfile = user?.email === profileEmail;
  const axiosSecure = useAxiosSecure();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  const {
    data: profileUser = {},
    refetch: refetchUser,
    isLoading: userLoading,
  } = useQuery({
    queryKey: ["user", profileEmail],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users?email=${profileEmail}`);
      return res.data;
    },
    enabled: !!profileEmail,
  });

  const { data: pets = [], isLoading: petsLoading } = useQuery({
    queryKey: ["userPets", profileUser._id],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/pets?ownerEmail=${profileUser.email}`
      );
      return res.data;
    },
    enabled: !!profileUser._id,
  });

  console.log(pets);

  const handleUpdateProfile = async (data) => {
    try {
      let photoURL = profileUser.photoURL;
      if (data.photo[0]) {
        const imageFile = data.photo[0];
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadRes = await fetch(
          `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_UPLOAD_KEY}`,
          {
            method: "POST",
            body: formData,
          }
        );
        const result = await uploadRes.json();
        photoURL = result.data.url;
      }

      const updatedData = {
        name: data.name,
        bio: data.bio,
        photoURL,
      };

      await axiosSecure.patch(`/users/${profileUser.email}`, updatedData);
      Swal.fire("Updated!", "Profile updated successfully", "success");
      refetchUser();
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  if (userLoading || petsLoading)
    return <span className="loading loading-dots"></span>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="flex gap-6 items-start">
        <img
          src={profileUser.photoURL}
          alt="profile"
          className="w-36 h-36 rounded-full object-cover border shadow"
        />

        <div className="flex-1">
          {isOwnProfile && isEditing ? (
            <form
              onSubmit={handleSubmit(handleUpdateProfile)}
              className="space-y-2"
            >
              <input
                type="text"
                defaultValue={profileUser.name}
                {...register("name")}
                className="input input-bordered w-full"
              />
              <input
                type="file"
                {...register("photo")}
                className="file-input w-full"
              />
              <textarea
                rows={3}
                placeholder="Your bio"
                defaultValue={profileUser.bio || ""}
                {...register("bio")}
                className="textarea textarea-bordered w-full"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-success"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{profileUser.name}</h2>
              <p className="text-gray-600">{profileUser.email}</p>
              {profileUser.bio && <p className="mt-2">{profileUser.bio}</p>}
              <p className="text-sm text-gray-400 mt-1">
                Joined: {new Date(profileUser.created_at).toLocaleDateString()}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-sm mt-2"
                >
                  Edit Profile
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <hr className="my-8" />

      <h3 className="text-xl font-semibold mb-4">
        {isOwnProfile ? "My Pets" : "Pets by this User"}
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        {pets.map((pet) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 30px rgba(255, 137, 4, 0.3)",
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="card bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden cursor-pointer"
          >
            <figure className="relative h-48 overflow-hidden rounded-t-xl">
              <img
                src={pet.images?.[0] || "https://via.placeholder.com/400x300"}
                alt={pet.name}
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110"
              />
              <div className="absolute top-3 left-3 z-10 bg-white/80 rounded-full p-2">
                <FaDog className="text-orange-500 text-xl" />
              </div>
            </figure>

            <div className="card-body p-6">
              <h2 className="card-title text-2xl font-semibold text-orange-600">
                {pet.name}
              </h2>
              <p className="text-gray-800 font-semibold text-lg">{pet.breed}</p>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 mt-3">
                <p>
                  <span className="font-medium">Gender:</span> {pet.gender}
                </p>
                <p>
                  <span className="font-medium">Age:</span> {pet.age} yrs
                </p>
                <p>
                  <span className="font-medium">Color:</span> {pet.color || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Weight:</span> {pet.weight || "N/A"}{" "}
                  kg
                </p>
              </div>

              {/* <div className="flex items-center gap-3 mt-3">
                {vaccinated && (
                  <div className="badge badge-info text-white bg-gradient-to-r from-cyan-400 to-blue-500 border-0">
                    Vaccinated
                  </div>
                )}
                {availabilityBadge}
              </div> */}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default UserProfile;
