import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginWithTwitter from './LoginWithTwitter';
import Callback from './Callback';
import TwitterProfile from './TwitterProfile';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginWithTwitter />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/profile" element={<TwitterProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
