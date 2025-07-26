import React from 'react';
import { Navigate } from 'react-router';
import useAuth from '../Hooks/useAuth';
import Loader from '../Components/Loader/Loader';


const UserProtectedRoute = ({children}) => {
    const {user , loading} = useAuth();


    if(loading) return <Loader></Loader>;

    if (!user) {
    return <Navigate to="/login" state={location.pathname}></Navigate>;
  }

    return children;
};

export default UserProtectedRoute;