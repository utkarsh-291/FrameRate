import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function Auth() {
  const { theme, darkMode } = useTheme();
  // Toggle between Login (true) and Register (false)
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Dynamically choose the endpoint based on which tab they are on
    const endpoint = isLogin ? '/api/login' : '/api/register';

    try {
      const response = await axios.post(`https://framerate-bfy0.onrender.com${endpoint}`, { email, password });

      if (isLogin) {
        // Save token and go to profile
        localStorage.setItem('token', response.data.token);
        navigate('/profile');
      } else {
        // If registration succeeds, automatically switch to the login tab
        alert("Registration successful! Please sign in.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', color: theme.text }}>
      <div style={{ background: theme.surface, padding: '2.5rem', borderRadius: '10px', width: '350px', border: `1px solid ${theme.border}` }}>
        
        {/* Tab Switcher */}
        <div style={{ display: 'flex', marginBottom: '2rem', borderBottom: `1px solid ${theme.border}` }}>
          <button 
            onClick={() => setIsLogin(true)}
            style={{ flex: 1, padding: '10px', background: 'none', border: 'none', color: isLogin ? '#00d8ff' : theme.secondaryText, borderBottom: isLogin ? '2px solid #00d8ff' : 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
          >
            Sign In
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            style={{ flex: 1, padding: '10px', background: 'none', border: 'none', color: !isLogin ? '#00d8ff' : theme.secondaryText, borderBottom: !isLogin ? '2px solid #00d8ff' : 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
          >
            Create Account
          </button>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {isLogin ? "Welcome Back" : "Join FrameRate"}
        </h2>

        {error && <div style={{ color: darkMode ? '#ff6b6b' : '#d93025', background: darkMode ? '#3a1f1f' : '#ffe5e5', padding: '10px', borderRadius: '5px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            style={{ padding: '12px', borderRadius: '5px', border: `1px solid ${theme.border}`, background: theme.inputBackground, color: theme.inputText }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            style={{ padding: '12px', borderRadius: '5px', border: `1px solid ${theme.border}`, background: theme.inputBackground, color: theme.inputText }}
          />
          <button 
            type="submit" 
            style={{ padding: '12px', background: '#00d8ff', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', fontSize: '1rem' }}
          >
            {isLoading ? (isLogin ? "Signing In..." : "Registering...") : (isLogin ? "Sign In" : "Register")}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Auth;