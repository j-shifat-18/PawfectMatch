import React from 'react';

const Navbar = () => {
    return (
        <div className="absolute top-0 left-0 w-full flex items-center justify-between px-12 py-6 z-10 bg-black/10 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
            <span className="text-orange-400 text-2xl font-bold">
            <i className="fas fa-paw"></i>
            </span>
            <span className="font-bold text-lg text-white">PawMatch</span>
        </div>
        <ul className="flex gap-10 font-medium text-gray-100">
            <li>
            <button><a href="#" className="hover:text-orange-400 transition">
                Home
            </a></button>
            </li>
            <li>
            <button><a href="#" className="hover:text-orange-400 transition">
                Adopt
            </a></button>
            </li>
            <li>
            <button><a href="#" className="hover:text-orange-400 transition">
                Shop
            </a></button>
            </li>
            <li>
            <button><a href="#" className="hover:text-orange-400 transition">
                Favorites
            </a></button>
            </li>
        </ul>
        <button className="bg-orange-400 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-orange-300 transition">
            Sign In
        </button>
        
        </div>
    );
};

export default Navbar;