// frontend/src/components/Navbar.jsx

import React from 'react';
import { Link } from 'react-router-dom'

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

export default Navbar;