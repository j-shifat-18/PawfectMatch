// MyPets.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useAuth from "../../Hooks/useAuth";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FaPaw, FaEdit, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import EmptyIllustration from "../../assets/empty-pets.svg"; // Add a nice SVG illustration here

const gradients = [
  "bg-gradient-to-br from-pink-500 to-red-400",
  "bg-gradient-to-br from-blue-400 to-indigo-500",
  "bg-gradient-to-br from-green-400 to-emerald-500",
  "bg-gradient-to-br from-yellow-400 to-orange-500",
  "bg-gradient-to-br from-purple-400 to-fuchsia-500",
];

const MyPets = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pets = [], isLoading } = useQuery({
    queryKey: ["myPets", user?.uid],
    queryFn: async () => {
      const res = await axiosSecure.get(`/pets?ownerId=${user?.uid}`);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ petId, updates }) => {
      return axiosSecure.patch(`/pets/${petId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myPets", user?.uid]);
    },
  });

  const handlePutForAdoption = (petId) => {
    navigate(`/create-adoption-post/${petId}`);
  };

  const handleCancelAdoption = (petId) => {
    Swal.fire({
      title: "Cancel Adoption Post?",
      text: "Are you sure you want to unlist this pet?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
    }).then((result) => {
      if (result.isConfirmed) {
        updateMutation.mutate({ petId, updates: { isListedForAdoption: false } });
        Swal.fire("Cancelled!", "This pet has been unlisted.", "success");
      }
    });
  };

  if (isLoading) return <div className="text-center py-20">Loading pets...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-10 flex items-center justify-center gap-2">
        <FaPaw className="text-primary" /> My Pets
      </h2>

      {pets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-center py-16"
        >
          <img src={EmptyIllustration} alt="No Pets" className="w-64 mb-6" />
          <h3 className="text-2xl font-semibold mb-2">No pet accounts yet</h3>
          <p className="text-base-content">Start by creating your first pet profile!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet, idx) => (
            <motion.div
              key={pet._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`card shadow-xl text-white ${gradients[idx % gradients.length]}`}
            >
              <figure className="h-52">
                <img
                  src={pet.images?.[0]}
                  alt={pet.name}
                  className="object-cover h-full w-full rounded-t-xl"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-2xl">{pet.name}</h3>
                <p><strong>Type:</strong> {pet.type}</p>
                <p><strong>Breed:</strong> {pet.breed}</p>
                <p><strong>Gender:</strong> {pet.gender}</p>
                <p><strong>Age:</strong> {pet.age} year(s)</p>
                {pet.color && <p><strong>Color:</strong> {pet.color}</p>}
                {pet.weight && <p><strong>Weight:</strong> {pet.weight}</p>}
                <p><strong>Vaccinated:</strong> {pet.vaccinated ? "Yes" : "No"}</p>
                <div className="mt-4 flex gap-2">
                  {pet.isListedForAdoption ? (
                    <button
                      onClick={() => handleCancelAdoption(pet._id)}
                      className="btn btn-sm btn-error text-white gap-2"
                    >
                      <FaTimesCircle /> Cancel Adoption
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePutForAdoption(pet._id)}
                      className="btn btn-sm btn-accent text-white gap-2"
                    >
                      <FaEdit /> Put for Adoption
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPets;
