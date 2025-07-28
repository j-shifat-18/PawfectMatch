import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import { motion } from "framer-motion";
import { FaShoppingCart } from "react-icons/fa";
import useAuth from "../../Hooks/useAuth";
import Swal from "sweetalert2";

const Shop = () => {
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("");

  const { data: products = [], refetch } = useQuery({
    queryKey: ["products", search, type, sort],
    queryFn: async () => {
      const res = await axiosPublic.get(
        `/products?search=${search}&type=${type}&sort=${sort}`
      );
      return res.data;
    },
  });

  const handleAddToCart = async (product) => {
    if (!user) return Swal.fire("Please login to add to cart");

    const order = {
      productId: product._id,
      buyerEmail: user.email,
      price: product.price,
    };

    try {
      await axiosPublic.post("/orders", order);
      Swal.fire("Added to Cart!", "", "success");
    } catch (err) {
      Swal.fire("Failed to add to cart", "", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-center my-8 text-orange-600">Shop Accessories</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full"
        />
        <input
          type="text"
          placeholder="Filter by type (e.g. toy, leash)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="input input-bordered w-full"
        />
        <select
          onChange={(e) => setSort(e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="">Sort by Price</option>
          <option value="price_low_high">Low to High</option>
          <option value="price_high_low">High to Low</option>
        </select>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <motion.div
            key={product._id}
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
                src={product.image || "https://via.placeholder.com/400x300"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110"
              />
            </figure>

            <div className="card-body p-6">
              <h2 className="card-title text-2xl font-semibold text-orange-600">
                {product.name}
              </h2>
              <p className="text-gray-700">{product.description}</p>
              <p className="text-gray-800 font-bold text-lg mt-2">${product.price}</p>

              <button
                onClick={() => handleAddToCart(product)}
                className="btn bg-gradient-to-r from-orange-400 to-yellow-400   hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-500 text-white font-semibold mt-4"
              >
                <FaShoppingCart className="mr-2" />
                Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
