import React from "react";
import Navbar from "../../Components/Navbar/Navbar";
import { Outlet, useLocation } from "react-router";
import Footer from "../../Components/Footer/Footer";
import useOfflineSync from "../../Hooks/useOfflineSync";

const RootLayout = () => {
  useOfflineSync();
  const location = useLocation();
  
  // Pages where we don't want to show the footer
  const noFooterPages = ['/SwipeCards', '/chat'];
  const shouldShowFooter = !noFooterPages.some(page => location.pathname.includes(page));
  
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

      {/* Content/Components */}
      <header>
        <Navbar></Navbar>
        <div className="h-20"></div>
      </header>
      <main className="min-h-screen">
        <Outlet></Outlet>
      </main>
      {shouldShowFooter && (
        <footer>
          <Footer></Footer>
        </footer>
      )}
    </div>
  );
};

export default RootLayout;
