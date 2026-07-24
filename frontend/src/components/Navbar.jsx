import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav style={{ padding: '1.2rem 2rem', background: '#111', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link to="/" style={{ color: '#00d8ff', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.5rem', letterSpacing: '1px' }}>
          FrameRate
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Explore</Link>

        {token ? (
          <>
            <Link to="/profile" style={{ color: '#00d8ff', textDecoration: 'none', fontWeight: '500' }}>My Profile</Link>
            <button 
              onClick={handleLogout}
              style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth" style={{ background: '#00d8ff', color: '#000', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
            Sign In / Join
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;