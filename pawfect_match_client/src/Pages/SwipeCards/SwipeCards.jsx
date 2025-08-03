import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const cards = [
  {
    image: "url('https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400')",
    name: "Milo",
    breed: "Cow",
    gender: "Male",
    traits: "Curious & Gentle",
    age: "6 months",
  },
  {
    image: "url('https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400')",
    name: "Bella",
    breed: "Labrador",
    gender: "Female",
    traits: "Playful & Friendly",
    age: "8 months",
  },
  {
    image: "url('https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400  cd ')",
    name: "Rocky",
    breed: "White Rabbit",
    gender: "Male",
    traits: "Energetic & Smart",
    age: "5 months",
  },
];

const Typewriter = ({ text }) => (
  <span className="font-bold text-xl text-gray-900 tracking-wide">
    {text.split("").map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.04 }}
      >
        {char}
      </motion.span>
    ))}
  </span>
);

const cardVariants = {
  initial: (direction) => ({
    y: 40,
    rotate: direction === "right" ? 8 : -8,
    opacity: 0,
    scale: 0.95,
  }),
  animate: {
    y: 0,
    rotate: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: (direction) => ({
    x: direction === "right" ? 350 : -350,
    rotate: direction === "right" ? 25 : -25,
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.35 }
  }),
};

const SwipeCards = () => {
  const [activeCard, setActiveCard] = useState(0);
  const [direction, setDirection] = useState("right");
  const [isDragging, setIsDragging] = useState(false);

  const [cardKey, setCardKey] = useState(0);

  const swipeCard = (dir) => {
    setDirection(dir);
    setCardKey(cardKey + 1); 
    setTimeout(() => {
      setActiveCard((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
    }, 350); // match exit transition duration
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x < -120) {
      swipeCard("left");
    } else if (info.offset.x > 120) {
      swipeCard("right");
    }
    setIsDragging(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: "linear-gradient(135deg, #fff7ed 0%, #fde68a 60%, #fdba74 100%)"
      }}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            {/* Removed the + icon */}
            <span className="text-2xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">
              Pet Cards
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold tracking-wide shadow-sm">
              Swipe & Match
            </span>
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">
            Discover your next furry friend!
          </p>
        </div>
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-5 flex flex-col items-center gap-4">
          <div className="relative w-full h-56 flex items-center justify-center">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={cardKey + activeCard}
                custom={direction}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                className="absolute rounded-xl w-full h-56 bg-cover bg-center border-4 border-orange-200 cursor-grab active:cursor-grabbing mb-2"
                style={{
                  backgroundImage: cards[activeCard].image,
                  touchAction: 'pan-x',
                }}
              />
            </AnimatePresence>
          </div>
          <div className="w-full flex flex-col items-center mb-2">
            <Typewriter text={cards[activeCard].name} />
            <p className="text-sm text-gray-700 mt-1">
              {cards[activeCard].breed} • {cards[activeCard].gender}
            </p>
            <p className="text-xs text-gray-500">{cards[activeCard].traits}</p>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium mt-2">
              {cards[activeCard].age}
            </span>
          </div>
          <div className="flex justify-center gap-8 mt-4 w-full">
            <button
              className="bg-orange-100 hover:bg-red-200 text-red-500 rounded-full p-3 shadow transition"
              onClick={() => swipeCard("left")}
              aria-label="Prev"
              disabled={isDragging}
            >
              &#10006;
            </button>
            <button
              className="bg-orange-100 hover:bg-green-200 text-green-500 rounded-full p-3 shadow transition"
              onClick={() => swipeCard("right")}
              aria-label="Next"
              disabled={isDragging}
            >
              &#10084;
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {cards.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${activeCard === i ? "bg-orange-400" : "bg-gray-300/70"}`}
              ></span>
            ))}
          </div>
          <div className="text-gray-400 text-xs mt-2 flex items-center gap-2">
            <span className="text-lg">&#128072;</span> Grab or tap buttons to swipe
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeCards;
