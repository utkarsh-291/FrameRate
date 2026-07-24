import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';

function Profile() {
  const [ratedMovies, setRatedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ratings'); // 'ratings' or 'settings'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRatings = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const dbResponse = await axios.get('http://localhost:5000/api/ratings', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const rawRatings = dbResponse.data;
        if (rawRatings.length === 0) {
          setRatedMovies([]);
          setIsLoading(false);
          return;
        }

        const tmdbPromises = rawRatings.map(async (item) => {
          const tmdbRes = await axios.get(
            `https://api.themoviedb.org/3/movie/${item.movie_id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
          );
          return { ...tmdbRes.data, userRating: item.rating };
        });

        const fullMovieData = await Promise.all(tmdbPromises);
        setRatedMovies(fullMovieData);
      } catch (err) {
        console.error("Profile error:", err);
        if (err.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/auth');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRatings();
  }, [navigate]);

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This will permanently wipe your account and all movie ratings!")) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete('http://localhost:5000/api/account', {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      alert("Account deleted.");
      navigate('/');
    } catch (err) {
      alert("Failed to delete account.");
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', color: 'white' }}>Loading your profile...</div>;
return (
    <div style={{ padding: '2rem', color: 'white', width: '100%', boxSizing: 'border-box', textAlign: 'left' }}>
      
      <h1 style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', margin: '0 0 1.5rem 0' }}>My Profile</h1>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '20px', margin: '0 0 2rem 0', borderBottom: '2px solid #222' }}>
        <button 
          onClick={() => setActiveTab('ratings')}
          style={{ padding: '10px 20px', background: 'none', border: 'none', color: activeTab === 'ratings' ? '#00d8ff' : '#888', borderBottom: activeTab === 'ratings' ? '2px solid #00d8ff' : 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
        >
          ⭐ My Rated Movies ({ratedMovies.length})
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          style={{ padding: '10px 20px', background: 'none', border: 'none', color: activeTab === 'settings' ? '#ff4d4d' : '#888', borderBottom: activeTab === 'settings' ? '2px solid #ff4d4d' : 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
        >
          ⚙️ Account Settings
        </button>
      </div>

      {/* TAB 1: RATINGS */}
      {activeTab === 'ratings' && (
        <div>
          {ratedMovies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #222' }}>
              <p style={{ fontSize: '1.2rem', color: '#aaa' }}>You haven't rated any movies yet.</p>
              <Link to="/" style={{ display: 'inline-block', marginTop: '15px', padding: '10px 20px', background: '#00d8ff', color: '#000', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Find Movies to Rate</Link>
            </div>
          ) : (
            /* THE FIX: Clean responsive grid that stretches across 100% of the screen */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', width: '100%' }}>
              {ratedMovies.map((movie, index) => (
                <div key={`${movie.id}-${index}`} style={{ position: 'relative', width: '100%' }}>
                  <MovieCard movie={movie} />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'gold', color: 'black', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
                    ⭐ {movie.userRating}/5
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SETTINGS / DANGER ZONE */}
      {activeTab === 'settings' && (
        <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', border: '1px solid #330000', maxWidth: '600px' }}>
          <h3 style={{ color: '#ff4d4d', marginTop: 0 }}>Danger Zone</h3>
          <p style={{ color: '#ccc', lineHeight: '1.5' }}>
            Deleting your account will permanently remove your email, password hash, and every star rating you have ever submitted on FrameRate. This action cannot be undone.
          </p>
          <button 
            onClick={handleDeleteAccount}
            style={{ backgroundColor: '#dc3545', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '1.5rem' }}
          >
            Permanently Delete My Account
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;