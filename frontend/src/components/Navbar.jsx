import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { darkMode, theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav
      style={{
        padding: '1.2rem 2rem',
        background: theme.surface,
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <Link
          to="/"
          style={{
            color: '#06b1cf',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            letterSpacing: '1px',
          }}
        >
          FrameRate
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link
          to="/"
          style={{
            color: theme.text,
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          Explore
        </Link>

        {token ? (
          <>
            <Link
              to="/profile"
              style={{
                color: theme.text,
                textDecoration: 'none',
                fontWeight: '500',
              }}
            >
              My Profile
            </Link>

            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                color: theme.text,
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            style={{
              background: '#00d8ff',
              color: '#000',
              padding: '8px 16px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Sign In / Join
          </Link>
        )}

        <button
          onClick={toggleTheme}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: '72px',
            padding: '7px 10px',
            borderRadius: '20px',
            border: `1px solid ${theme.border}`,
            background: theme.surfaceAlt,
            color: theme.text,
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          {darkMode ? 'Light' : 'Dark'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
