import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useAuth from "../../Hooks/useAuth";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FaPaw, FaEdit, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router";
import EmptyIllustration from "../../assets/empty-pets.svg";

const gradients = [
  "from-orange-100 via-orange-200 to-orange-300",
  "from-teal-100 via-teal-200 to-teal-300",
  "from-rose-100 via-rose-200 to-rose-300",
  "from-sky-100 via-sky-200 to-sky-300",
  "from-violet-100 via-violet-200 to-violet-300",
];

const MyPets = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pets = [], isLoading } = useQuery({
    queryKey: ["myPets", user?.uid],
    queryFn: async () => {
      const res = await axiosSecure.get(`/pets?ownerEmail=${user?.email}`);
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
    navigate(`/dashboard/create-adoption-post/${petId}`);
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
        updateMutation.mutate({
          petId,
          updates: { isListedForAdoption: false },
        });
        Swal.fire("Cancelled!", "This pet has been unlisted.", "success");
      }
    });
  };

  if (isLoading)
    return <div className="text-center py-20">Loading pets...</div>;

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
          <p className="text-base-content">
            Start by creating your first pet profile!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet, idx) => (
            <motion.div
              key={pet._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
              }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 15,
                delay: idx * 0.05,
              }}
              className={`rounded-2xl shadow-md overflow-hidden bg-gradient-to-br ${
                gradients[idx % gradients.length]
              } relative`}
            >
              {/* Image section */}
              <div className="h-52 w-full overflow-hidden relative group">
                <img
                  src={pet.images?.[0]}
                  alt={pet.name}
                  className="object-cover w-full h-full rounded-t-2xl group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
                <div className="absolute inset-0 bg-black/10"></div>
                <h3 className="absolute bottom-2 left-4 text-white text-2xl font-bold drop-shadow">
                  {pet.name}
                </h3>
              </div>

              {/* Info and Buttons (same as before) */}
              <div className="p-5 text-gray-800">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Type:</span> {pet.type}
                  </p>
                  <p>
                    <span className="font-semibold">Breed:</span> {pet.breed}
                  </p>
                  <p>
                    <span className="font-semibold">Gender:</span> {pet.gender}
                  </p>
                  <p>
                    <span className="font-semibold">Age:</span> {pet.age}{" "}
                    year(s)
                  </p>
                  {pet.color && (
                    <p>
                      <span className="font-semibold">Color:</span> {pet.color}
                    </p>
                  )}
                  {pet.weight && (
                    <p>
                      <span className="font-semibold">Weight:</span>{" "}
                      {pet.weight}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">Vaccinated:</span>{" "}
                    {pet.vaccinated ? "Yes" : "No"}
                  </p>
                </div>

                <div className="mt-5 flex justify-end">
                  {pet.isListedForAdoption ? (
                    <button
                      onClick={() => handleCancelAdoption(pet._id)}
                      className="btn btn-error text-white gap-2"
                    >
                      <FaTimesCircle /> Cancel Adoption
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePutForAdoption(pet._id)}
                      className="btn btn-primary text-white gap-2"
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
