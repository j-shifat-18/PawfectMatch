import { useEffect, useState } from "react";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link } from "react-router";
import AdoptionCard from "../../Components/AdoptionCard/AdoptionCard";

const Adopt = () => {
  const axiosSecure = useAxiosSecure();
  const [adoptionPosts, setAdoptionPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [availability, setAvailability] = useState("available");
  const [favorites, setFavorites] = useState([]);

  const fetchPosts = async () => {
    const { data } = await axiosSecure.get(
      `/adoption-posts?search=${search}&type=${type}&availability=${availability}`
    );
    setAdoptionPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, [search, type, availability]);

  const handleFavoriteToggle = (postId) => {
    setFavorites((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
    // TODO: send to backend to save favorite for user
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Find Your Pawfect Match 🐾</h1>

      {/* Search & Filters */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <input
          type="text"
          placeholder="Search by pet name"
          className="input input-bordered w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select select-bordered w-full"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Bird">Bird</option>
        </select>
        <select
          className="select select-bordered w-full"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        >
          <option value="available">Available</option>
          <option value="adopted">Adopted</option>
        </select>
      </div>

      {/* Adoption Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adoptionPosts.map((post) => <AdoptionCard post={post} favorites={favorites} handleFavoriteToggle={handleFavoriteToggle}></AdoptionCard> )}
      </div>

      {adoptionPosts.length === 0 && (
        <div className="text-center mt-10">
          <img
            src="https://i.ibb.co/FW9sKBr/no-data.png"
            alt="No Results"
            className="mx-auto w-52"
          />
          <p className="text-lg font-medium text-gray-600 mt-4">
            No adoption posts found. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default Adopt;
