import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// 1. We MUST import all the components we built in our local folders!
import Home from './pages/Home';
import Search from './pages/Search';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetails from './pages/MovieDetails';

// 2. A simple Navbar so we can click around
function Navbar() {
  return (
    <nav style={{ padding: '1rem', background: '#1a1a1a', display: 'flex', gap: '15px' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
      <Link to="/search" style={{ color: 'white', textDecoration: 'none' }}>Search</Link>
      <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
      <Link to="/login" style={{ color: '#00d8ff', textDecoration: 'none' }}>Login</Link>
      <Link to="/register" style={{ color: '#00d8ff', textDecoration: 'none' }}>Register</Link>
    </nav>
  );
}

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