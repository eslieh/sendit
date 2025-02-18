import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/landing';
import "./App.css";
import Flex from './pages/flex';
import Auth from './pages/auth';
import UserHome from './pages/user';
import DeliveriesUser from './pages/user/deliveries';
import AccountUser from './pages/user/account';
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
      </Routes>
    </Router>
  );
}

export default App;
