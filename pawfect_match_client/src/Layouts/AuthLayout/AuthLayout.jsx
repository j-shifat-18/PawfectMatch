import React from "react";
import { Outlet } from "react-router";

// import authImg from "../../assets/authImage.jpg";



const AuthLayout = () => {
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

      <div className="flex flex-col lg:flex-row-reverse h-full ">
        <div className="min-h-screen flex justify-center items-center flex-1">
          {/* <img className="w-full max-h-screen" src={authImg} /> */}
          <iframe
            className="z-10"
            src="https://my.spline.design/worldplanet-PBtkUIKnwIgjbH4MiebFG8n7/"
            frameborder="0"
            width="100%"
            height="100%"
          ></iframe>
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
