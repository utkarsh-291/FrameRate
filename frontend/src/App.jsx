// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// 1. We MUST import all the components we built in our local folders!
import Home from './pages/Home';
import Search from './pages/Search';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetails from './pages/MovieDetails';
import Navbar from './components/Navbar'

// 3. The main App component with the correct traffic cop rules
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      
      <Routes>
        {/* Notice how we use the actual imported components here now! */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/movie/:id" element={<MovieDetails />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;