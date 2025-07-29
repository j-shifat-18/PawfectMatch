import { useState } from "react";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useAuth from "../../Hooks/useAuth";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "../../Components/Loader/Loader";
import { Link } from "react-router-dom";
import AdoptionCard from "../../Components/AdoptionCard/AdoptionCard";
import { useEffect } from "react";

const Favourites = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [favorites, setFavorites] = useState([]);
  const [requestedMap, setRequestedMap] = useState({});


  // Fetch favorite post IDs
  const {
    data: favoriteIds,
    isLoading: loadingFavorites,
    isFetching: fetchingFavorites,
    isError: errorFavorites,
  } = useQuery({
    queryKey: ["favoriteIds", user?.uid],
    enabled: !!user?.uid,
    queryFn: async () => {
      const res = await axiosSecure.get(`/favorites/${user.uid}`);
      setFavorites(res.data);
      return res.data;
    },
  });

  // Fetch all posts only when favorites are loaded and not empty
  const {
    data: allPosts,
    isLoading: loadingPosts,
    isError: errorPosts,
  } = useQuery({
    queryKey: ["adoptionPosts"],
    enabled: !!user?.uid && favoriteIds?.length > 0,
    queryFn: async () => {
      const res = await axiosSecure.get("/adoption-posts");
      return res.data;
    },
  });


  // fetch adoption posts 
    useEffect(() => {
      if (!user?.email) return;
  
      const fetchRequests = async () => {
        try {
          const res = await axiosSecure.get(`/my-adoption-requests/${user.email}`);
          // Build map { petId: true }
          const map = {};
          res.data.forEach((req) => {
            map[req.petId] = true;
          });
          setRequestedMap(map);
        } catch (error) {
          console.error("Failed to load adoption requests:", error);
        }
      };
  
      fetchRequests();
    }, [user, axiosSecure]);

  if (errorFavorites || errorPosts) {
    return (
      <div className="text-center py-10 text-red-500">
        Something went wrong. Please try again.
      </div>
    );
  }

  // Show loader while fetching favoriteIds or posts
  if (loadingFavorites || loadingPosts || fetchingFavorites) {
    return (
      <div className="text-center my-10">
        <Loader />
      </div>
    );
  }

  // Filter posts to only favorites
  const favoritePosts =
    allPosts?.filter((post) => favoriteIds.includes(post._id)) || [];

  const handleFavoriteToggle = async (postId) => {
    if (!user) {
      toast.error("You must be logged in to favorite a post.");
      return;
    }

    const isFav = favorites.includes(postId);

    try {
      if (isFav) {
        await axiosSecure.delete("/favorites", {
          data: { userId: user.uid, postId },
        });
        setFavorites((prev) => prev.filter((id) => id !== postId));
        toast.info("Removed from favorites.");
      } else {
        await axiosSecure.post("/favorites", { userId: user.uid, postId });
        setFavorites((prev) => [...prev, postId]);
        toast.success("Added to favorites!");
      }
      queryClient.invalidateQueries(["favoriteIds", user?.uid]);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update favorites.");
    }
  };

  const handleAdoptionRequested = (petId) => {
    setRequestedMap((prev) => ({ ...prev, [petId]: true }));
  };

  // After loading finishes, if no favorites, show no data UI
  if (!favoritePosts.length) {
    return (
      <div className="p-4 max-w-6xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6">Favorite Furry Friends 🐾</h1>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <img
            src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
            alt="No favorites"
            className="w-40 h-40 mb-4 opacity-60"
          />
          <h2 className="text-2xl font-bold text-gray-700">No Favorites Yet</h2>
          <p className="text-gray-500 mt-2">
            Start exploring adorable pets and mark your favorites!
          </p>
          <Link to="/adopt" className="btn text-white btn-primary mt-4">
            Browse Pets
          </Link>
        </div>
      </div>
    );
  }

  // Otherwise show favorite posts
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">
        Favorite Furry Friends 🐾
      </h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoritePosts.map((post) => (
          <AdoptionCard
            key={post._id}
            post={post}
            favorites={favorites}
            handleFavoriteToggle={handleFavoriteToggle}
            isAlreadyRequested={requestedMap[post.petId] || false}
            setIsAlreadyRequested={() => handleAdoptionRequested(post.petId)}
          />
        ))}
      </div>
    </div>
  );
};

export default Favourites;
