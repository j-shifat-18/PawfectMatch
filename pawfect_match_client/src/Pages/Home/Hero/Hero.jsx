import React, { useState } from 'react';
import bgimage from "../../../assets/Front-dog.jpg"; 
import { Link } from 'react-router';


const Hero = () => {
  // Example swipeable cards data delete this array and replace with info from backend
  const cards = [
    {
      image: "url('/Cat 1.jpg')",
      name: "Milo",
      breed: "Cow",
      gender: "Male",
      traits: "Curious & Gentle",
      age: "6 months",
    },
    {
      image: "url('/Dog 1.jpg')",
      name: "Bella",
      breed: "Labrador",
      gender: "Female",
      traits: "Playful & Friendly",
      age: "8 months",
    },
    {
      image: "url('/Rabbit 1.jpg')",
      name: "Rocky",
      breed: "White Rabbit",
      gender: "Male",
      traits: "Energetic & Smart",
      age: "5 months",
    },
  ];

  const [activeCard, setActiveCard] = useState(0);

  // Swipe logic (left/right)
  const swipeCard = (dir) => {
    if (dir === "left") {
      setActiveCard((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
    } else {
      setActiveCard((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <section
      className="relative w-full min-h-[90vh] flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgimage})`, 
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-0"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-row items-center justify-between w-full max-w-6xl px-8 py-20">
        {/* Left Side */}
        <div className="flex flex-col gap-6 max-w-xl">
          <h1 className="text-5xl font-bold text-white leading-tight drop-shadow-lg">
            Find Your{" "}
            <span className="text-orange-400 drop-shadow-lg">Perfect Match</span>
          </h1>
          <p className="text-lg text-gray-200 mb-4">
            Swipe through adorable pets waiting for their forever home. Every swipe could change two lives forever.
          </p>
          <div className="flex gap-4">
            <Link to='/adopt' className="bg-orange-400 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-orange-500 transition flex items-center gap-2">
              Start Swiping <span className="text-lg">&#8594;</span>
            </Link>
            <button className="bg-gray-800/60 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-gray-700 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Side - Card */}
        <div className="flex mt-10 flex-col items-center justify-end">
          <div className="bg-gray-900/30 backdrop-blur-md rounded-2xl shadow-2xl p-6 min-w-[360px] max-w-sm flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-semibold text-white">Swipe for Love</span>
              <span className="text-orange-400 text-lg">&#10084;</span>
            </div>
            {/* Swipeable Card */}
            <div className="bg-white rounded-xl shadow-lg p-4 w-full">
              <img
                src={cards[activeCard].image}
                alt={cards[activeCard].name}
                className="rounded-lg w-full h-48 object-cover border-4 border-green-200"
              />
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg text-gray-900">{cards[activeCard].name}</h2>
                  <p className="text-sm text-gray-700">
                    {cards[activeCard].breed} • {cards[activeCard].gender} • {cards[activeCard].traits}
                  </p>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  {cards[activeCard].age}
                </span>
              </div>
              {/* Swipe Buttons */}
              <div className="flex justify-center gap-6 mt-6">
                <button
                  className="bg-gray-200 hover:bg-red-300 text-red-500 rounded-full p-3 shadow transition"
                  onClick={() => swipeCard("left")}
                  aria-label="Nope"
                >
                  &#10006;
                </button>
                <button
                  className="bg-gray-200 hover:bg-green-300 text-green-500 rounded-full p-3 shadow transition"
                  onClick={() => swipeCard("right")}
                  aria-label="Like"
                >
                  &#10084;
                </button>
              </div>
            </div>
            {/* Card Pagination */}
            <div className="flex justify-center gap-2 mt-2">
              {cards.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full ${activeCard === i ? "bg-orange-400" : "bg-gray-300/70"}`}
                ></span>
              ))}
            </div>
            <div className="text-gray-200 text-sm mt-2 flex items-center gap-2">
              <span className="text-lg">&#128072;</span> Swipe or tap buttons to choose
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;