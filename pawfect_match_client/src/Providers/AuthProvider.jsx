import React, { useState } from "react";
import { AuthContext } from "../Contexts/AuthContext";
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "../Firebase/firebase.init";

const provider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = ()=>{
    return signInWithPopup(auth , provider);
  }

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginUser = (email , password)=>{
    setLoading(true);
    return signInWithEmailAndPassword(auth , email , password);
  }

  const updateUserProfile = (updateData) => {
    return updateProfile(auth.currentUser, updateData);
  };

  const logOutUser = ()=>{
    return signOut(auth);
  }

  const sendResetEmail = (email)=>{
    return sendPasswordResetEmail(auth , email);
  }



  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => {
      unSubscribe();
    };
  }, []);

  const userInfo = {
    user,
    setUser,
    loading,
    setLoading,
    createUser,
    updateUserProfile,
    signInWithGoogle,
    logOutUser,
    loginUser,
    sendResetEmail

  };


  return <AuthContext value={userInfo}>{children}</AuthContext>;
};

export default AuthProvider;
