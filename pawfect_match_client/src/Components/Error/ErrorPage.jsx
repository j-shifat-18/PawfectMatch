import React from "react";
import errorSvg from '../../assets/404-error.svg'
import { Link } from "react-router";

const ErrorPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <img src={errorSvg} className="max-w-xl" alt="" />
      <Link to='/' className="btn bg-primary font-medium text-lg rounded-full hover:bg-accent text-white">Go To Homepage</Link>
    </div>
  );
};

export default ErrorPage;
