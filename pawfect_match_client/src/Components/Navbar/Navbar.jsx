import React from "react";
import { Link, NavLink, useNavigate } from "react-router";
import useAuth from "../../Hooks/useAuth";
import Swal from "sweetalert2";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import PawfectMatchLogo from "../PawfectMatchLogo/PawfectMatchLogo";

// absolute top-0 left-0 w-full flex items-center justify-between px-12 py-6 z-10 bg-black/10 backdrop-blur-md border-b border-white/10


// bg-orange-400 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-orange-300 transition

const Navbar = () => {
  const { user, logOutUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logOutUser();
    setDropdownOpen(false);
    navigate('/');
  };


  const linkClass = ({ isActive }) =>
    `hover:text-primary transition-colors font-medium text-base ${
      isActive ? "text-primary" : ""
    }`;

  return (
    <nav className="fixed w-full flex items-center justify-between px-12 py-6 z-20 bg-transparent backdrop-blur-xl border-b border-white/10">
      {/* Logo and Name */}
      <PawfectMatchLogo></PawfectMatchLogo>
        {/* <SkyTowerLogo></SkyTowerLogo> */}
      {/* Nav Links */}
      <div className="flex items-center gap-8 text-black">
        <NavLink to="/" className={linkClass}>Home</NavLink>
        <NavLink to="/adopt" className={linkClass}>Adopt</NavLink>
        <NavLink to="/shop" className={linkClass}>Shop</NavLink>
        <NavLink to="/favourites" className={linkClass}>Favoutites</NavLink>
      </div>
      {/* User/Login */}
      <div className="relative flex items-center">
        {!user ? (
          <Link
            to="/auth/login"
            
            title="Login"
          >
            <span aria-label="login" className="border-2 rounded-full border-primary  px-4 py-1 text-lg bg-primary hover:bg-secondary hover:border-secondary text-secondary-content hover:text-secondary-content transition-colors font-semibold">Login</span>
          </Link>
        ) : (
          <div ref={dropdownRef} className="relative">
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'U')}`}
              alt="Profile"
              onClick={() => setDropdownOpen((open) => !open)}
              className="w-11 h-11 rounded-full border-2 border-secondary cursor-pointer object-cover hover:scale-105 transition-transform"
            />
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 bg-base-100 text-base-content shadow-lg rounded-lg min-w-[200px] flex flex-col py-2 z-30 animate-fade-in" style={{top: '48px'}}>
                <div className="px-5 py-3 font-semibold text-primary border-b border-base-300 cursor-default">
                  {user.displayName || user.email}
                </div>
                <Link
                  to="/dashboard"
                  className="px-5 py-3 transition-colors border-b border-base-300 hover:bg-secondary"
                  onClick={() => setDropdownOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-5 py-3 text-left hover:bg-secondary transition-colors rounded-b-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
