import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import useAuth from "../../../Hooks/useAuth";
import { GrGoogle } from "react-icons/gr";
import Swal from "sweetalert2";

const Login = () => {
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error , setError ] = useState("");

  const { loginUser, signInWithGoogle } = useAuth();

  const handleLogin = (data) => {

    loginUser(data.email, data.password)
      .then(async (result) => {
   
        const user = result.user;
        const userInfo = {
          email: user.email,
          role: "user",
          created_at: new Date().toISOString(),
          last_log_in: new Date().toISOString(),
        };

        const userRes = await axiosPublic.post("/users", userInfo);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Logged in successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate(`${location.state ? location.state : "/"}`);
      })
      .catch((error) => {
        setError("Invalid Email or password!");
        console.log(error);
      });
  };

  const handleGoogleLogin = () => {
    signInWithGoogle()
      .then(async (result) => {
       
        const user = result.user;
        const userInfo = {
          name: user.displayName,
          email: user.email,
          role: "user",
          created_at: new Date().toISOString(),
          last_log_in: new Date().toISOString(),
        };

        const userRes = await axiosPublic.post("/users", userInfo);
      

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Account created successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate(`${location.state ? location.state : "/"}`);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div className="card text-black  w-full max-w-md shrink-0 ">
      <div className="card-body">
        <h1 className="text-4xl font-extrabold">Welcome Back</h1>
        <p className="font-medium text-lg mb-5">Login with PawfectMatch</p>
        <form className="fieldset" onSubmit={handleSubmit(handleLogin)}>
          {/* Email */}
          <label className="label font-medium text-black text-base">
            Email
          </label>
          <input
            type="email"
            {...register("email", {
              required: true,
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            })}
            className="input bg-transparent w-full border-[#CBD5E1]"
            placeholder="Email"
          />
          {errors.email?.type === "required" && (
            <p className="text-red-500 text-base">Please enter your Email .</p>
          )}
          {errors.email?.type === "pattern" && (
            <p className="text-red-500 text-base">
              Please enter a valid Email .
            </p>
          )}

          {/* Password */}
          <label className="label font-medium text-black text-base">
            Password
          </label>
          <input
            type="password"
            {...register("password", {
              required: true,
            })}
            className="input w-full bg-transparent border-[#CBD5E1]"
            placeholder="Password"
          />

          {errors.password?.type === "required" && (
            <p className="text-red-500 text-base">Please enter Password .</p>
          )}
          <div>
            <Link to="/forgetPassword" className="link link-hover text-base">
              Forget password ?{" "}
            </Link>
          </div>

          {/* Register Button */}
          <button className="btn text-lg mt-4 bg-primary mb-3 border-none hover:bg-orange-300">
            Login
          </button>

          {
            error && <p className="text-red-500 text-base">{error}</p>
          }

          {/* Login Link */}
          <div>
            <p className="text-base">
              Don't have an account ?{" "}
              <Link
                to="/auth/register"
                className="text-primary link link-hover"
              >
                Register
              </Link>
            </p>
          </div>
        </form>

        <div>
          <p className="text-primary text-center">Or</p>
        </div>

        {/* Google login */}
        <button
          onClick={handleGoogleLogin}
          className="btn bg-primary text-black border-none"
        >
          {/* <svg
            aria-label="Google logo"
            width="26"
            height="26"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <g>
              <path d="m0 0H512V512H0" fill="#fff"></path>
              <path
                fill="#34a853"
                d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
              ></path>
              <path
                fill="#4285f4"
                d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
              ></path>
              <path
                fill="#fbbc02"
                d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
              ></path>
              <path
                fill="#ea4335"
                d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
              ></path>
            </g>
          </svg> */}
          <GrGoogle />
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
