import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";


const CouponShowcase = () => {
  const axiosPublic = useAxiosPublic();

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const res = await axiosPublic.get("/coupons");
      return res.data;
    },
  });

  const gradientColors = [
    "from-[#F97316] to-[#EF4444]", // Orange to Red
    "from-[#D946EF] to-[#8B5CF6]", // Pink to Purple
    "from-[#6366F1] to-[#8B5CF6]", // Indigo to Violet
    "from-[#10B981] to-[#059669]", // Green gradient
  ];

  if (isLoading)
    return (
      <span className="loading loading-spinner block mx-auto my-10"></span>
    );

  return (
    <div className="my-12 px-4">
      <h2 className="text-3xl font-bold text-center">Exclusive Offers</h2>
      <p className="text-center text-gray-500 mb-10">
        Take advantage of our limited-time offers and special discounts for
        products.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {coupons.map((coupon, index) => (
          <motion.div
            key={coupon._id}
            className={`rounded-xl p-5 text-white shadow-lg bg-gradient-to-r ${
              gradientColors[index % 4]
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold">{coupon.title}</h3>
                <p className="text-2xl font-bold">{coupon.discount}%</p>
                <p className="text-xs mt-1">{coupon.description}</p>
              </div>
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2l4 -4"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs mt-4">
              <span className="bg-white/10  backdrop-blur-md border border-white/30 text-white font-semibold px-2 py-1 rounded">
                {coupon.code}
              </span>
              <span className="opacity-90">Until {new Date(coupon.expireDate).toLocaleDateString()}</span>
            </div>

            <button className=" w-full mt-4 bg-white/10  backdrop-blur-md border border-white/30 text-white px-6 py-2 rounded-xl shadow-md hover:bg-white/20 transition">
              Claim Offer
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CouponShowcase;
