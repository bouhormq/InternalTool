/* eslint-disable jsx-a11y/alt-text */
import { UserAuth } from '../context/authContex';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {  Link} from "react-router-dom";
import logo from "../media/logoBig.png"




export  function Home(){
  const { user, logOut, googleSignIn} = UserAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user !== null && user !== {}) {
      navigate('orders');
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logOut()
    } catch (error) {
      console.log(error)
    }
  }

  return null
};

