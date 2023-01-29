import React from 'react';
import { useGoogleAuth, useGoogleUser } from 'react-gapi-auth2';

export const SignIn = ({ children }) => {
  // The `GoogleAuth` object described here:
  // https://developers.google.com/identity/sign-in/web/reference#authentication 
  const { googleAuth } = useGoogleAuth();
  // The `GoogleUser` object described here:
  // https://developers.google.com/identity/sign-in/web/reference#users
  const { currentUser } = useGoogleUser();

  if (false) {
    return (
      <>
        <p>Welcome user {currentUser.getBasicProfile().getName()}</p>
        <button onClick={() => googleAuth.signOut()}>Sign Out</button>
      </>
    )
  }
  
  return (
    <>
      <p>Click here to sign in:</p>
      <button onClick={() => googleAuth.signIn()}>Sign In</button>
    </>
  )
};

export default SignIn;