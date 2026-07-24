import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function MovieDetails() {
  const { id } = useParams(); 
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(0); 
  const [error, setError] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tmdbRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        setMovie(tmdbRes.data);

        const token = localStorage.getItem('token');
        if (token) {
          const dbRes = await axios.get('http://localhost:5000/api/ratings', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const existingRating = dbRes.data.find(r => String(r.movie_id) === String(id));
          if (existingRating) {
            setUserRating(existingRating.rating);
          }
        }
      } catch (err) {
        console.error("Error fetching details:", err);
        setError("Failed to load movie details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]); 

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  const handleRateMovie = async (stars) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showMessage("❌ You must be logged in to rate a movie!");      
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/ratings', 
        { movieId: id, rating: stars },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserRating(stars);
    } catch (err) {
      console.error(err);
      showMessage("❌ Failed to save rating.");
    }
  };

  const handleDeleteRating = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`http://localhost:5000/api/ratings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRating(0); 
    } catch (err) {
      console.error(err);
      showMessage("❌ Failed to remove rating."); // Replaced old alert()
    }
  };

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading details...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  if (!movie) return <div style={{ padding: '2rem' }}>Movie not found.</div>;

  return (
    <div style={{ 
      padding: '2rem', 
      minHeight: '100vh',
      backgroundImage: movie.backdrop_path 
        ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` 
        : '#111',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'white'
    }}>
      <div style={{ display: 'flex', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div>
          {movie.poster_path ? (
            <img 
              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
              alt={movie.title} 
              style={{ borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
            />
          ) : (
            <div style={{ width: '300px', height: '450px', backgroundColor: '#333' }}>No Image</div>
          )}
        </div>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{movie.title}</h1>
          <p><strong>Release Date:</strong> {movie.release_date}</p>
          <p><strong>Runtime:</strong> {movie.runtime} minutes</p>
          <p><strong>Genres:</strong> {movie.genres?.map(g => g.name).join(', ')}</p>
          
          <h3 style={{ marginTop: '1.5rem' }}>Overview</h3>
          <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>{movie.overview}</p>
        </div>
      </div>
      
      {/* Rating Box */}
      <div style={{ margin: '2rem auto', padding: '1.5rem', border: '1px solid #00d8ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '400px', borderRadius: '8px', backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Rate this movie:</h3>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} 
             onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => {
            
            // THE FIX 1: Check if hovering FIRST, otherwise fall back to saved userRating
            const isGold = star <= (hoverRating || userRating);

            return (
              <button 
                key={star} 
                onClick={() => handleRateMovie(star)}
                // THE FIX 2: Update hover state when mouse touches this button
                onMouseEnter={() => setHoverRating(star)}
                style={{ 
                  fontSize: '2.2rem', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  // THE FIX 3: Apply the dynamic gold/gray color & smooth animation
                  color: isGold ? 'gold' : '#555',
                  transition: 'color 0.05s ease-in-out, transform 0.1s ease',
                  transform: star <= hoverRating ? 'scale(1.15)' : 'scale(1)',
                  padding: '0 4px'
                }}
              >
                ★
              </button>
            );
          })}
        </div>

        {/* Custom Message Notification */}
        {message && (
          <p style={{
            margin: "15px 0 5px 0",
            fontWeight: "bold",
            color: message.startsWith("❌") ? "#ff4d4d" : "#00d8ff",
          }}>
            {message}
          </p>
        )}

        {/* Remove Rating Button */}
        {userRating > 0 && (
          <div style={{ marginTop: '15px' }}>
            <button 
              onClick={handleDeleteRating}
              style={{
                padding: '8px 14px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'opacity 0.2s'
              }}
            >
              Remove Rating
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieDetails;