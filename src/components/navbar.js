/* eslint-disable jsx-a11y/alt-text */
import { UserAuth } from '../context/authContex';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {  Link} from "react-router-dom";
import logo from "../media/logoBig.png"



export function Navbar(){
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
    if (user !== null) {
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

  if (user === null) {
    return (
      <div className='bg-gray-200 w-full'>
      <nav class="flex flex-wrap border-b border-gray-200 py-1.5">
          <img  src={logo} style={{display:"block", height:"25px", marginTop:"15px", marginLeft:"10px", marginRight:"15px", position:"relative", bottom:"6px"}}/>
          {user?.displayName ? (
              <button style={{position: "absolute", top: "0px", right: "0px", paddingRight: "16px", paddingTop: "16px"}} onClick={handleSignOut} type="button" class="text-white bg-orange-500 hover:bg-orange-400 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2"><svg class="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                  Log Out
              </button>
          ) : (
              <button style={{position: "absolute", top: "0px", right: "0px", marginRight: "10px", marginTop: "5px"}} onClick={handleGoogleSignIn} type="button" class="text-white bg-orange-500 hover:bg-orange-400 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2"><svg class="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                  Sign in with Google
              </button>
          )}
        </nav>
      </div>  
    );
  }
  else return ( 
      <div className='bg-gray-200 w-full'>
      <nav class="flex flex-wrap border-b border-gray-200">
        <img  src={logo} style={{display:"block", height:"25px", marginTop:"15px", marginLeft:"10px", marginRight:"15px"}}/>
        <Link class="inline-block text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg py-4 px-4 text-sm font-medium text-center" to="orders"> Orders </Link>
        <Link class="inline-block text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg py-4 px-4 text-sm font-medium text-center" to="returns"> Returns </Link>
        <Link class="inline-block text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg py-4 px-4 text-sm font-medium text-center" to="exchanges"> Exchanges </Link>
        <Link class="inline-block text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg py-4 px-4 text-sm font-medium text-center" to="logs"> Logs </Link>
        <Link class="inline-block text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg py-4 px-4 text-sm font-medium text-center" to="flows"> Flows </Link>
        <Link class="inline-block text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg py-4 px-4 text-sm font-medium text-center" to="inventory"> Inventory </Link>
        <Link class="inline-block text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg py-4 px-4 text-sm font-medium text-center" to="clients"> Clients</Link>
        <Link class="inline-block text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg py-4 px-4 text-sm font-medium text-center" to="recipients"> Recipients</Link>
        <Link class="inline-block text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg py-4 px-4 text-sm font-medium text-center" to="contacts"> Contacts</Link>
        <Link class="inline-block text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg py-4 px-4 text-sm font-medium text-center" to="warehouses"> Warehouses</Link>
        <Link class="inline-block text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg py-4 px-4 text-sm font-medium text-center" to="messages"> Messages</Link>
        <Link class="inline-block text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg py-4 px-4 text-sm font-medium text-center" to="calendar"> Calendar</Link>
        {/*
        <div className="logo">
            <img src={logo} width="155"  style={{position: "absolute", top: "0px", right: "0px", marginRight: "10px", marginTop: "10px"}}/>
        </div>
        */}
        {user?.displayName ? (
            <button style={{position: "absolute", top: "0px", right: "0px", marginRight: "10px", marginTop: "5px"}} onClick={handleSignOut} type="button" class="text-white bg-orange-500 hover:bg-orange-400 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2"><svg class="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                Log Out
            </button>
        ) : (
            <button style={{position: "absolute", top: "0px", right: "0px", marginRight: "10px", marginTop: "5px"}} onClick={handleGoogleSignIn} type="button" class="text-white bg-orange-500 hover:bg-orange-400 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2"><svg class="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                Sign in with Google
            </button>
        )}
        </nav>
    </div>
  );
};

