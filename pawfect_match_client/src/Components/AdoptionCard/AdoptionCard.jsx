import { Link } from "react-router";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { motion } from "framer-motion";

const AdoptionCard = ({ post, favorites, handleFavoriteToggle }) => {
  const { petInfo = {} } = post;

  const availabilityBadge = petInfo.isListedForAdoption ? (
    <div className="badge badge-success text-white bg-gradient-to-r from-green-400 to-teal-500 border-0">
      Available
    </div>
  ) : (
    <div className="badge badge-error text-white bg-gradient-to-r from-red-400 to-pink-500 border-0">
      Not Available
    </div>
  );

  return (
    <motion.div
      key={post._id}
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
          src={
            post.images?.[0] ||
            petInfo.images?.[0] ||
            "https://via.placeholder.com/400x300"
          }
          alt={petInfo.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110"
        />
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => handleFavoriteToggle(post._id)}
            className="text-2xl text-red-500 hover:text-red-600 transition-colors"
            aria-label="Toggle Favorite"
          >
            {favorites.includes(post._id) ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
      </figure>

      <div className="card-body p-6 ">
        <h2 className="card-title text-2xl font-semibold text-orange-600">
          {petInfo.name}
        </h2>
        <p className="text-gray-800 font-semibold text-lg">{post.title}</p>
        <p className="text-gray-600 text-sm">{post.description}</p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 mt-3">
          <p>
            <span className="font-medium">Breed:</span> {petInfo.breed}
          </p>
          <p>
            <span className="font-medium">Age:</span> {petInfo.age} yrs
          </p>
          <p>
            <span className="font-medium">Color:</span> {petInfo.color || "N/A"}
          </p>
          <p>
            <span className="font-medium">Weight:</span>{" "}
            {petInfo.weight || "N/A"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {petInfo.vaccinated && (
            <div className="badge badge-info text-white bg-gradient-to-r from-cyan-400 to-blue-500 border-0">
              Vaccinated
            </div>
          )}
          {availabilityBadge}
        </div>

        <Link
          to={`/message-owner/${post.ownerEmail}`}
          className="btn btn-primary btn-sm px-6 py-2 rounded-full font-semibold hover:bg-orange-600 transition-colors"
        >
          Message Owner
        </Link>
      </div>
    </motion.div>
  );
};

export default AdoptionCard;
