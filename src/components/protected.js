import React from 'react';
import { Navigate,Outlet } from 'react-router-dom';
import { UserAuth } from '../context/authContex';

export default function Protected(){
  const { user } = UserAuth();
  if (!user) {
    return <Navigate to={"/"} replace />;
  }

  return <Outlet />;
};

