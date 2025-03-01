import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/landing';
import "./App.css";
import Flex from './pages/flex';
import Auth from './pages/auth';
import UserHome from './pages/user';
import DeliveriesUser from './pages/user/deliveries';
import AccountUser from './pages/user/account';
import CourierIndex from './pages/couriers';
import History from './pages/couriers/history';
import Deliveries from './pages/couriers/deliveries';
import Company from './pages/couriers/company';
function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Landing/>} />
        <Route path='/flex' element={<Flex/>}/>
        <Route path='/auth' element={<Auth/>}/>
        <Route path='/user' element={<UserHome/>}/>
        <Route path='/user/deliveries' element={<DeliveriesUser/>}/>
        <Route path='/user/account' element={<AccountUser/>}/>
        <Route path='/courier' element={<CourierIndex/>}/>
        <Route path='/courier/deliveries' element={<Deliveries/>}/>
        <Route path='/courier/history' element={<History/>}/>
        <Route path='/courier/company' element={<Company/>}/>
      </Routes>
    </Router>
  );
}

export default App;
