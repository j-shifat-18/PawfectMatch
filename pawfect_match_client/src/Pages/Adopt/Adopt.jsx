import { useState } from "react";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link } from "react-router";
import AdoptionCard from "../../Components/AdoptionCard/AdoptionCard";
import useAuth from "../../Hooks/useAuth";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../Components/Loader/Loader";

const Adopt = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [availability, setAvailability] = useState("available");

  const [favorites, setFavorites] = useState([]);

  // Fetch adoption posts with react-query
  const {
    data: adoptionPosts = [],
    isLoading: postsLoading,
    // refetch,
  } = useQuery({
    queryKey: ["adoptionPosts", search, type, availability],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/adoption-posts?search=${search}&type=${type}&availability=${availability}`
      );
      return res.data;
    },
  });

  // Fetch favorites
  const { isLoading: favoritesLoading } = useQuery({
    queryKey: ["favorites", user?.uid],
    enabled: !!user,
    queryFn: async () => {
      const res = await axiosSecure.get(`/favorites/${user.uid}`);
      setFavorites(res.data);
      return res.data;
    },
  });

  const handleFavoriteToggle = async (postId) => {
    if (!user) {
      toast.error("You must be logged in to favorite a post.");
      return;
    }

    const isFav = favorites.includes(postId);

    try {
      if (isFav) {
        // Remove favorite
        await axiosSecure.delete("/favorites", {
          data: { userId: user.uid, postId },
        });
        setFavorites((prev) => prev.filter((id) => id !== postId));
        toast.info("Removed from favorites.");
      } else {
        // Add favorite
        await axiosSecure.post("/favorites", { userId: user.uid, postId });
        setFavorites((prev) => [...prev, postId]);
        toast.success("Added to favorites!");
      }

      // Refetch favorites if needed
      queryClient.invalidateQueries(["favorites", user?.uid]);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update favorites.");
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">
        Find Your Pawfect Match 🐾
      </h1>

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

      {/* Loading State */}
      {(postsLoading || favoritesLoading) && (
        <div className="text-center my-10">
          <Loader></Loader>
        </div>
      )}

      {/* Adoption Cards */}
      {!postsLoading && adoptionPosts.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adoptionPosts.map((post) => (
            <AdoptionCard
              key={post._id}
              post={post}
              favorites={favorites}
              handleFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}

      {/* No Data */}
      {!postsLoading && adoptionPosts.length === 0 && (
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
