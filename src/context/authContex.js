import { useContext, createContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase';
import React from 'react';
import {onSnapshot, collection} from 'firebase/firestore';
import db from '../firebase'





const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState({});
  const [numberFlows, setnumberFlows] = useState();
  const [clients, setClients] = useState({});
  const [warehouses, setWarehouses] = useState(
    {"DE-FFM-NWES": {address: "Finkenhofstraße 12, 60322 Frankfurt am Main, Germany", city: "Frankfurt am Main", country: "Germany",country_code: "DE", delivers_to: ['60306', '60308', '60310', '60311', '60312', '60313', '60314', '60315', '60316', '60318', '60320', '60322', '60323', '60325', '60329', '60385', '60487', '60594', '60596'], postal_code: "60322", province: "Hesse"}},
  );

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar')
    provider.addScope('https://www.googleapis.com/auth/userinfo.profile')
    provider.addScope('https://www.googleapis.com/auth/userinfo.email')
    provider.addScope('openid')
    signInWithPopup(auth, provider);
  };

  const logOut = () => {
      signOut(auth)
      setUser(null)
  }

  useEffect(() => {

    console.log("state = unknown (until the callback is invoked)")
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("state = definitely signed in")
        setUser(currentUser);
        setAccessToken(currentUser.accessToken)
        console.log(currentUser)
      }
      else {
        console.log("state = definitely signed out")
      }
    })
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(  () => {
    const colRefClietns = collection(db, "clients" )
    const colRefWarehouses = collection(db, "warehouses" )
    const colRefFlows = collection(db, "flow" )
    let isMounted = true;
    onSnapshot(colRefFlows, (snapshot) => {
      setnumberFlows(snapshot.size)
    })
    onSnapshot(colRefClietns, (snapshot) => {
      setClients([])
      if (isMounted) {
        let clients = {};
        snapshot.docs.forEach((doc) => {
          clients[doc.id] = doc.data()
          setClients(clients)
        })
      }
    })
    onSnapshot(colRefWarehouses, (snapshot) => {
      setWarehouses([])
      if (isMounted) {
        let warehouse = {};
        snapshot.docs.forEach((doc) => {
          warehouse[doc.id] = doc.data()
          setWarehouses(warehouse)
        })
      }
    })
    return () => {
      isMounted = false;
    };
  })

  return (
    <AuthContext.Provider value={{ googleSignIn, logOut, user, accessToken, numberFlows, clients, warehouses}}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};