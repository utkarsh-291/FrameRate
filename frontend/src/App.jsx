import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar'; 
import Home from './pages/Home';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import MovieDetails from './pages/MovieDetails';

function App() {
  return (
    <BrowserRouter>
      <Navbar /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/movie/:id" element={<MovieDetails />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;