import React from "react";
import Navbar from "../../Components/Navbar/Navbar";
import { Outlet } from "react-router";
import Footer from "../../Components/Footer/Footer";

const RootLayout = () => {
  return (
    <div className="min-h-screen w-full relative bg-black">
      {/* Copper Forge Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249, 115, 22, 0.25), transparent 70%), #000000",
        }}
      />

      {/* Your Content/Components */}

      <header>
        <Navbar></Navbar>
      </header>
      <main className="pt-10">
        <Outlet></Outlet>
      </main>
      <footer>
        <Footer></Footer>
      </footer>
    </div>
  );
};

export default RootLayout;
