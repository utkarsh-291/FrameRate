// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard'; // Reusing our awesome component!

function Dashboard() {
  const [ratedMovies, setRatedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRatings = async () => {
      // 1. Check for the wristband. If no token, kick them to login!
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // 2. Fetch the raw ratings from our PostgreSQL database
        // We MUST include the Authorization header!
        const dbResponse = await axios.get('http://localhost:5000/api/ratings', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const rawRatings = dbResponse.data; // e.g. [{ movie_id: 27205, rating: 5 }, ...]

        // 3. If they haven't rated anything, we can stop here.
        if (rawRatings.length === 0) {
          setRatedMovies([]);
          setIsLoading(false);
          return;
        }

        // 4. The Magic Trick: Promise.all()
        // We have an array of IDs. We need to make a TMDB request for EVERY ID.
        // Promise.all lets us run all those network requests at the exact same time!
        const tmdbPromises = rawRatings.map(async (item) => {
          const tmdbRes = await axios.get(
            `https://api.themoviedb.org/3/movie/${item.movie_id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
          );
          
          // Combine the TMDB movie data with the user's personal star rating
          return {
            ...tmdbRes.data,
            userRating: item.rating 
          };
        });

        // Wait for all the TMDB requests to finish
        const fullMovieData = await Promise.all(tmdbPromises);
        
        // Save the combined data to state!
        setRatedMovies(fullMovieData);

      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to load your ratings. Please try logging in again.");
        // If the token is expired/invalid, clear it and force login
        if (err.response && err.response.status === 403) {
            localStorage.removeItem('token');
            navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRatings();
  }, [navigate]); // navigate is a dependency because we use it inside the effect

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading your movies...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;


  // 1. Add this function inside function Dashboard() { ... }
const handleDeleteAccount = async () => {
    // Give the user a warning popup before destroying their data
    if (!window.confirm("Are you sure? This will permanently delete your account and all your movie ratings!")) {
        return;
    }

    const token = localStorage.getItem('token');
    try {
        await axios.delete('http://localhost:5000/api/account', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Clear their VIP wristband from memory and send them to the homepage
        localStorage.removeItem('token');
        alert("Your account has been permanently deleted.");
        navigate('/');
    } catch (err) {
        console.error("Error deleting account:", err);
        alert("Failed to delete account. Please try logging in again.");
    }
};

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Rated Movies</h1>
      {ratedMovies.length === 0 ? (
        <p>You haven't rated any movies yet. Go search for some!</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
          {ratedMovies.map((movie) => (
            <div key={movie.id} style={{ position: 'relative' }}>
                <MovieCard movie={movie} />
                
                {/* A little badge to show their personal rating on top of the card */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'gold',
                    color: 'black',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontWeight: 'bold'
                }}>
                    ⭐ {movie.userRating}/5
                </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: '4rem', borderTop: '1px solid #333', paddingTop: '2rem' }}>
        <button 
          onClick={handleDeleteAccount}
          style={{ 
            backgroundColor: '#dc3545', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}

export default Dashboard;