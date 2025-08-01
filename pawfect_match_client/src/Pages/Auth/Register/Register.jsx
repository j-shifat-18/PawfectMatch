import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";

import { GrGoogle } from "react-icons/gr";
import useAuth from "../../../Hooks/useAuth";
import Swal from "sweetalert2";

const Register = () => {
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { createUser, signInWithGoogle, updateUserProfile } = useAuth();

  const [profilePic, setProfilePic] = useState();
  const [selectedImage, setSelectedImage] = useState(null);

  // const handleImageUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const imageUrl = URL.createObjectURL(file);
  //     setSelectedImage(imageUrl);
  //   }
  // };

  const handleRegister = (data) => {
    console.log(data);
    createUser(data.email, data.password)
      .then(async () => {
        // console.log(result.user);

        const userInfo = {
          name: data.name,
          email: data.email,
          photoURL: profilePic,
          role: "user",
          created_at: new Date().toISOString(),
          last_log_in: new Date().toISOString(),
        };

        const userRes = await axiosPublic.post("/users", userInfo);
        console.log(userRes);

        const name = data.name;
        const image = profilePic;
        updateUserProfile({
          displayName: name,
          photoURL: image,
        })
          .then(() => {
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: "Account created successfully",
              showConfirmButton: false,
              timer: 1500,
            });
            navigate("/");
          })
          .catch((error) => console.log("error ", error));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleGoogleLogin = () => {
    signInWithGoogle()
      .then(async (result) => {
        console.log(result);
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
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleImageUpload = async (e) => {
    const image = e.target.files[0];
    // console.log(image)
    const formData = new FormData();
    formData.append("image", image);
    const imageUploadURL = `https://api.imgbb.com/1/upload?key=${
      import.meta.env.VITE_IMAGE_UPLOAD_KEY
    }`;
    const res = await axios.post(imageUploadURL, formData);
    setProfilePic(res.data.data.url);
    setSelectedImage(res.data.data.url);
  };
  return (
    <div className="card text-black  w-full max-w-md shrink-0 ">
      <div className="card-body">
        <h1 className="text-4xl font-extrabold">Create an Account</h1>
        <p className="font-medium text-lg mb-5">Register with PawfectMatch</p>
        <form className="fieldset" onSubmit={handleSubmit(handleRegister)}>
          {/* Image */}
          <label className="label font-medium text-black text-base">
            Image
          </label>

          {/* Label wraps the avatar and hides the file input */}
          <label htmlFor="avatarUpload" className="cursor-pointer w-fit">
            <div className="avatar">
              <div className="w-16 rounded-full border-2 border-primary">
                <img
                  src={
                    selectedImage ||
                    "https://img.daisyui.com/images/profile/demo/spiderperson@192.webp"
                  }
                  alt="Avatar"
                />
              </div>
            </div>
            <input
              id="avatarUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {/* Name */}
          <label className="label font-medium text-black text-base">Name</label>
          <input
            type="text"
            {...register("name", {
              required: true,
            })}
            className="input bg-transparent w-full border-[#CBD5E1]"
            placeholder="Name"
          />
          {errors.name?.type === "required" && (
            <p className="text-red-500 text-base">Please enter your name .</p>
          )}

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
              pattern:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/,
            })}
            className="input w-full bg-transparent border-[#CBD5E1]"
            placeholder="Password"
          />

          {errors.password?.type === "required" && (
            <p className="text-red-500 text-base">Please enter Password .</p>
          )}
          {errors.password?.type === "pattern" && (
            <p className="text-red-500 text-base">
              Password must have one uppercase , one lower case and one special
              character.
            </p>
          )}

          {/* Register Button */}
          <button className="btn text-lg mt-4 bg-primary mb-3 border-none">
            Register
          </button>

          {/* Login Link */}
          <div>
            <p className=" text-base">
              Already have an account ?{" "}
              <Link to="/auth/login" className="text-primary link link-hover">
                Login
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
          <GrGoogle />
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Register;
