import React from "react";
import { Navigate } from "react-router";
import useAuth from "../Hooks/useAuth";
import Loader from "../Components/Loader/Loader";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const UserProtectedRoute = ({ children }) => {
  const { user , loading} = useAuth();
  // const axiosSecure = useAxiosSecure();

  // const { data: userRole, isLoading } = useQuery({
  //   queryKey: ["users", user?.email],
  //   queryFn: async () => {
  //     const res = await axiosSecure.get(`/users?email=${user.email}`);
  //     return res.data;
  //   },
  // });

  if (loading) return <Loader></Loader>;
  // if (isLoading) return <Loader></Loader>;
  // console.log(userRole.role)

  if (!user ) {
    return <Navigate to="/auth/login" state={location.pathname}></Navigate>;
  }

  return children;
};

export default UserProtectedRoute;
