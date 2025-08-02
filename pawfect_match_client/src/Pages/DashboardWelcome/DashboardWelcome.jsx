import React from "react";
import { Link } from "react-router";
import dashboardImg from '../../assets/admin-dashboard.svg'

const DashboardWelcome = () => {
  return (
    <div className="flex flex-col-reverse md:flex-row items-center justify-center min-h-[80vh] px-6 py-12 bg-gray-100">
      {/* Left Text Section */}
      <div className="md:w-1/2 text-center md:text-left space-y-6">
        <div className="flex items-center justify-center md:justify-start gap-3">
          {/* Dashboard icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 10h4v11H3V10zm7-7h4v18h-4V3zm7 10h4v8h-4v-8z"
            />
          </svg>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Dashboard Overview
          </h1>
        </div>

        <p className="text-lg text-gray-600">
          Welcome to your dashboard panel! From here, you can create and manage pet profiles, view your listed pets, post pets for adoption, explore and purchase pet accessories, and securely manage all your payments — everything you need for a smooth and loving pet adoption journey.
        </p>

        <Link to="/">
          <button className="bg-primary text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-secondary transition">
            Go to Home Page
          </button>
        </Link>
      </div>

      {/* Right Illustration Section */}
      <div className="md:w-1/2 mb-10 md:mb-0">
        <img
          src={dashboardImg}
          alt="Dashboard Illustration"
          className="w-full max-w-md mx-auto"
        />
      </div>
    </div>
  );
};

export default DashboardWelcome;
