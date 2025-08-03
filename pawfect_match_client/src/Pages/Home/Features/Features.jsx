import React from "react";
import { motion } from "framer-motion";
import { FaPaw, FaUserPlus, FaShoppingBag } from "react-icons/fa";
import PetForm from "../../../assets/Login.jpeg";
import Shop from "../../../assets/Shop.jpg";
// Example images (replace with appropriate images)
const swipeImg =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80";
const swipeImg2 =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80";
const swipeImg3 =
  "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=400&q=80";
const profileImg = PetForm; 
const shopImg = Shop;
  

const features = [
  {
    icon: <FaPaw className="text-3xl text-orange-400" />,
    title: "Swipe Pet Cards",
    img: swipeImg,
    desc: "Easily browse through adorable pets and find your perfect companion with a simple swipe. This makes discovering pets fun and interactive, helping you connect with the right match quickly.",
    animation: { x: 60, opacity: 0 },
    imgFirst: false, // Text left, image right
  },
  {
    icon: <FaUserPlus className="text-3xl text-orange-400" />,
    title: "Pet Profile Creation with AI",
    img: profileImg,
    desc: "Simply upload a picture of your pet and let our AI automatically fill out the profile form for you. This saves you time and ensures all the key details are captured accurately, making it easier for your pet to find a loving home.",
    animation: { x: -60, opacity: 0 },
    imgFirst: true, // Image left, text right
  },
  {
    icon: <FaShoppingBag className="text-3xl text-orange-400" />,
    title: "Shop for Your Pet",
    img: shopImg,
    desc: "Find and buy the best products for your furry friend, all in one place. Save time and ensure your pet gets quality accessories, toys, and essentials.",
    animation: { x: 60, opacity: 0 },
    imgFirst: false, // Text left, image right
  },
];

const Features = () => (
  <section className="py-16 bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
    <div className="max-w-6xl mx-auto px-4">
      <motion.h2
        className="text-4xl font-extrabold text-center mb-16 text-gray-900"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        Why PawfectMatch?
      </motion.h2>
      <div className="flex flex-col gap-16">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className={`flex flex-col ${
              i % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
            } items-center gap-8 md:gap-16`}
            initial={f.animation}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{
              duration: 0.7,
              delay: i * 0.15,
              type: "spring",
              stiffness: 120,
            }}
            viewport={{ once: true }}
          >
            {/* Image Section */}
            <div className="flex-shrink-0 w-full md:w-1/2 flex justify-center">
              {/* Conditional rendering for the layered cards */}
              {i === 0 ? (
                <div className="relative w-64 h-80">
                  {/* Tilted card on the right, behind the main card */}
                  <div
                    className="absolute inset-0 w-64 h-80 rounded-2xl overflow-hidden shadow-xl
                      bg-gray-200 transform rotate-6 scale-95 origin-bottom-right translate-x-4 translate-y-4"
                  >
                    <img
                      src={swipeImg3}
                      alt="Tilted swipe card 2"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {/* Tilted card on the left, behind the main card */}
                  <div
                    className="absolute inset-0 w-64 h-80 rounded-2xl overflow-hidden shadow-xl
                      bg-gray-300 transform -rotate-6 scale-95 origin-bottom-left -translate-x-4 translate-y-4"
                  >
                    <img
                      src={swipeImg2}
                      alt="Tilted swipe card 1"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {/* Main card on top */}
                  <div className="absolute inset-0 w-64 h-80 rounded-2xl overflow-hidden shadow-xl bg-white">
                    <img
                      src={f.img}
                      alt={f.title}
                      className="object-cover w-full h-full"
                    />
                    <span className="absolute top-3 left-3 bg-white/80 rounded-full p-3 shadow text-2xl">
                      {f.icon}
                    </span>
                  </div>
                </div>
              ) : (
                // Original card for other features
                <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={f.img}
                    alt={f.title}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    decoding="async"
                    fetchPriority={i === 0 ? "high" : "low"}
                  />
                  <span className="absolute top-3 left-3 bg-white/80 rounded-full p-3 shadow text-2xl">
                    {f.icon}
                  </span>
                </div>
              )}
            </div>

            {/* Text Section */}
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h3
                className={`text-2xl font-bold mb-3 text-gray-800 w-full ${
                  i % 2 === 0 ? "md:text-left" : "md:text-right"
                }`}
              >
                {f.title}
              </h3>
              <p
                className={`text-gray-600 text-lg ${
                  i % 2 === 0 ? "md:text-left" : "md:text-right"
                } w-full`}
              >
                {f.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;