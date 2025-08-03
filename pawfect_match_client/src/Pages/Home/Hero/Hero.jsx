import React from 'react';
import bgimage from "../../../assets/Front-dog.jpg"; 
import { Link } from 'react-router';
//import SwipeCard from '../../../Components/SwipeCard/SwipeCard';

const Hero = () => {
  return (
    <section
      className="relative w-full min-h-[90vh] flex items-center justify-center bg-cover bg-center mb-2 "
      style={{
        backgroundImage: `url(https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400)`,
        backgroundPosition: "center 20%", // Moved down by 40%
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-0"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-row items-center justify-center w-full max-w-6xl px-8 py-20">
        {/* Left Side */}
        <div className="flex flex-col gap-6 max-w-xl justify-center">
          <h1 className="text-5xl font-bold text-white leading-tight drop-shadow-lg text-center">
            Find Your{" "}
            <span className="text-orange-400 drop-shadow-lg ">Perfect Match</span>
          </h1>
          <p className="text-lg text-gray-200 mb-4 text-center">
            Swipe through adorable pets waiting for their forever home. Every swipe could change two lives forever.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to='/swipecards' className="bg-orange-400 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-orange-500 transition flex items-center gap-2">
              Start Swiping <span className="text-lg">&#8594;</span>
            </Link>
            <Link to='/adopt' className="bg-orange-400 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-orange-500 transition flex items-center gap-2">
              Adopt
            </Link>
          </div>
        </div>
        {/* Right Side - Swipe Card
        <SwipeCard cards={cards} /> */}
      </div>
    </section>
  );
};

export default Hero;