import React from "react";
import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";

// Testimonial avatars (replace with appropriate images)
const avatar1 = "https://placehold.co/100x100/FF9800/FFFFFF?text=JD";
const avatar2 = "https://placehold.co/100x100/FFA726/FFFFFF?text=AS";
const avatar3 = "https://placehold.co/100x100/FFB74D/FFFFFF?text=LM";

const testimonials = [
  {
    quote:
      "PawfectMatch helped me find my dream dog, Max! The AI profile creation saved so much time, and the swiping feature made it fun to browse. Highly recommend!",
    name: "Jane Doe",
    title: "Happy Pet Parent",
    avatar: avatar1,
  },
  {
    quote:
      "I was looking for specific grooming products for my cat, and the shopping section had everything I needed. It's truly a one-stop shop for pet lovers!",
    name: "Alex Smith",
    title: "Cat Enthusiast",
    avatar: avatar2,
  },
  {
    quote:
      "The interface is so user-friendly and intuitive. Finding a new companion felt effortless, and the support team was fantastic when I had questions.",
    name: "Laura Miller",
    title: "New Adopter",
    avatar: avatar3,
  },
];

const Testimonials = () => {
  return (
    <motion.div
      className="mt-24 text-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
    >
      <h2 className="text-4xl font-extrabold text-gray-900 mb-12">
        What Our Users Say
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center border border-gray-100"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <FaQuoteLeft className="text-orange-400 text-4xl mb-4" />
            <p className="text-gray-700 italic mb-6 text-lg">"{t.quote}"</p>
            <img
              src={t.avatar}
              alt={t.name}
              className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-orange-200"
            />
            <h4 className="font-bold text-gray-900 text-xl">{t.name}</h4>
            <p className="text-gray-500 text-sm">{t.title}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Testimonials;