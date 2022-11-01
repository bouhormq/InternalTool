import React from 'react';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { Orders } from './pages/orders';
import { Inventory } from './pages/inventory'
import { Clients } from "./pages/clients";
import { Returns } from "./pages/returns";
import { Flow } from "./pages/flow";
import { Warehouses } from "./pages/warehouses";
import { AuthContextProvider } from './context/authContex';
import {Home} from './pages/home'
import {Navbar} from "./components/navbar";
import Protected from "./components/protected"
import { Logs } from "./pages/logs";
import { Messages } from './pages/messages';





function App() {

  
  return (
    <div className="App">
      <AuthContextProvider>
        <Router>
          <Navbar/>
          <Routes>
          <Route path='/' element={<Home/>} />
          <Route element={<Protected/>}>
            <Route path="deliveries" element={<Orders/>}/>
            <Route path="returns" element={<Returns/>}/>
            <Route path="logs" element={<Logs/>}/>
            <Route path="flow" element={<Flow/>}/>
            <Route path="inventory" element={<Inventory/>}/>
            <Route path="clients" element={<Clients/>}/>
            <Route path="warehouses" element={<Warehouses/>}/>
            <Route path="messages" element={<Messages/>}/>
          </Route>
          </Routes>
        </Router>
        <div id="signInDiv"></div>
      </AuthContextProvider>
    </div>
  );
}

export default App;
