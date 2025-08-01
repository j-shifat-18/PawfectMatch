import React from "react";
import { Outlet } from "react-router";

import authImg from "../../assets/auth-image.svg";

const AuthLayout = () => {
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
      <div className="flex flex-col lg:flex-row-reverse h-full ">
        <div className="min-h-screen flex justify-center items-center flex-1">
          <img className="w-full max-h-screen" src={authImg} />
          
        </div>
        <div className="flex-1">
          <div className="pt-6 pl-6"></div>
          <div className="flex justify-center items-center max-h-screen">
            <Outlet></Outlet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
