import React, { useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../../../Hooks/useAuth";
import Swal from "sweetalert2";

const ForgetPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { sendResetEmail } = useAuth();

  const [loading, setLoading] = useState(false);

  const handleForgetPassword = (data) => {
    setLoading(true);

    sendResetEmail(data.email)
      .then(() => {
        sendResetEmail(false);
        Swal.fire({
          icon: "success",
          title: "Offline Pet Synced",
          text: `Reset Email Sent . Check you mail.`,
          timer: 3000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        console.log(error);
        // ..
      });
  };

  return (
    <div className="card text-black  w-full max-w-md shrink-0 ">
      <div className="card-body">
        <h1 className="text-4xl font-extrabold">Forget Password?</h1>
        <p className="font-medium text-lg mb-5">Send Reset Email</p>
        <form
          className="fieldset"
          onSubmit={handleSubmit(handleForgetPassword)}
        >
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

          {/* Register Button */}
          <button className="btn text-lg mt-4 bg-primary mb-3 border-none hover:bg-orange-300">
            {loading ? "Sending Email" : "Send Reset Email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
