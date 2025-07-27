import React from "react";
import Navbar from "../../Components/Navbar/Navbar";
import { Outlet } from "react-router";
import Footer from "../../Components/Footer/Footer";

const RootLayout = () => {
  return (
    <div className="min-h-screen w-full relative bg-white">
      {/* Soft Yellow Glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
      radial-gradient(circle at center, #FFB347 0%, transparent 50%)
    `,
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />

      {/* Your Content/Components */}
      <header>
        <Navbar></Navbar>
        <div className="h-23"></div>
      </header>
      <main>
        <Outlet></Outlet>
      </main>
      <footer>
        <Footer></Footer>
      </footer>
    </div>
  );
};

export default RootLayout;
