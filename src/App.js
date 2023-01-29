import './index.css'
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { Orders } from './pages/orders';
import { Inventory } from './pages/inventory'
import { Clients } from "./pages/clients";
import { Returns } from "./pages/returns";
import { Flows } from "./pages/flows";
import { Warehouses } from "./pages/warehouses";
import { AuthContextProvider } from './context/authContex';
import {Home} from './pages/home'
import {Navbar} from "./components/navbar";
import Protected from "./components/protected"
import { Logs } from "./pages/logs";
import { Messages } from './pages/messages';
import {Recipients} from './pages/recipients'
import {Contacts} from './pages/contacts'
import { Exchanges } from './pages/exchanges';
import { Calendars } from './pages/calendar';
import { onLoad } from './gapi';
import { Riders } from './pages/riders';




function App() {
  useEffect(() => {
    onLoad()
  }, []);  
  return (
    <div className="App">
      <AuthContextProvider>
        <Router>
          <Navbar/>
          <Routes>
          <Route path='/' element={<Home/>} />
          <Route element={<Protected/>}>
            <Route path="orders" element={<Orders/>}/>
            <Route path="returns" element={<Returns/>}/>
            <Route path="exchanges" element={<Exchanges/>}/>
            <Route path="logs" element={<Logs/>}/>
            <Route path="flows" element={<Flows/>}/>
            <Route path="inventory" element={<Inventory/>}/>
            <Route path="clients" element={<Clients/>}/>
            <Route path="recipients" element={<Recipients/>}/>
            <Route path="contacts" element={<Contacts/>}/>
            <Route path="warehouses" element={<Warehouses/>}/>
            <Route path="messages" element={<Messages/>}/>
            <Route path="riders" element={<Riders/>}/>
            <Route path="calendar" element={<Calendars/>}/>
          </Route>
          </Routes>
        </Router>
        <div id="signInDiv"></div>
      </AuthContextProvider>
    </div>
  );
}

export default App;
