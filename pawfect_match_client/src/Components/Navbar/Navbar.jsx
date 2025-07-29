import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import useAuth from "../../Hooks/useAuth";
import Swal from "sweetalert2";
import PawfectMatchLogo from "../PawfectMatchLogo/PawfectMatchLogo";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, logOutUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logOutUser();
    setDropdownOpen(false);
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `hover:text-primary transition-colors font-medium lg:mr-6 text-base ${
      isActive ? "text-primary" : ""
    }`;

  const menuLinks = (
    <>
      <NavLink to="/" className={linkClass}>
        Home
      </NavLink>
      <NavLink to="/adopt" className={linkClass}>
        Adopt
      </NavLink>
      <NavLink to="/shop" className={linkClass}>
        Shop
      </NavLink>
      <NavLink to="/favourites" className={linkClass}>
        Favourites
      </NavLink>
    </>
  );



  return (
    <div className="navbar bg-transparent fixed z-50 backdrop-blur-3xl md:px-6 py-4  lg:px-6 lg:py-5 shadow-sm ">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            {menuLinks}
          </ul>
        </div>
        <PawfectMatchLogo></PawfectMatchLogo>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {menuLinks}
        </ul>
      </div>
        {/* User / Login */}
      <div className="navbar-end">
        {!user ? (
          <Link to="/auth/login" title="Login">
            <span className="border-2 rounded-full border-primary px-4 py-1 text-lg bg-primary hover:bg-secondary hover:border-secondary hover:text-secondary-content transition-colors font-semibold text-white">
              Login
            </span>
          </Link>
        ) : (
          <div ref={dropdownRef} className="relative">
            <img
              src={
                user.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.displayName || user.email || "U"
                )}`
              }
              alt="Profile"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-11 h-11 rounded-full border-2 border-secondary cursor-pointer object-cover hover:scale-105 transition-transform"
            />
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 bg-base-100 text-base-content shadow-lg rounded-lg min-w-[200px] flex flex-col py-2 z-30 animate-fade-in" style={{ top: "48px" }}>
                <div className="px-5 py-3 font-semibold text-primary border-b border-base-300 cursor-default">
                  {user.displayName || user.email}
                </div>
                <Link
                  to="/order/cart"
                  className="px-5 py-3 transition-colors border-b border-base-300 hover:bg-secondary"
                  onClick={() => setDropdownOpen(false)}
                >
                  Cart
                </Link>
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
    </div>
  );
};

export default Navbar;
