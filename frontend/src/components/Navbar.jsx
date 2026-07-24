import React from 'react';
import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <nav style={{padding: '1rem', background: '#1a1a1a', color: 'white', display: 'flex', justifyContent: 'space-between'}}>
            <div>
                <Link to="/" style={{color: '#00d8ff', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.5rem'}}>
                    FrameRate
                </Link>
            </div>
            <div style={{display: 'flex', gap: '15px'}}>
                <Link to="/" style={{color: 'white', textDecoration: 'none' }}>Home</Link>
                <Link to="/search" style={{color: 'white', textDecoration: 'none' }}>Search</Link>
                <Link to="/dashboard" style={{color: 'white', textDecoration: 'none' }}>Dashboard</Link>
            </div>
        </nav>
    );
}

export default Navbar;