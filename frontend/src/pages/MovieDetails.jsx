import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function MovieDetails() {
  const { id } = useParams(); 
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(0); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch TMDB movie details
        const tmdbRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        setMovie(tmdbRes.data);

        // 2. NEW: Check if the logged-in user already rated this movie!
        const token = localStorage.getItem('token');
        if (token) {
          const dbRes = await axios.get('http://localhost:5000/api/ratings', {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Match database movie_id against the URL id
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

  const handleRateMovie = async (stars) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in to rate a movie!");
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/ratings', 
        { movieId: id, rating: stars },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserRating(stars);
      alert("Rating saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save rating. Please try again.");
    }
  };

  // NEW: Function to delete the rating
  const handleDeleteRating = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`http://localhost:5000/api/ratings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRating(0); // Turn off the stars in the UI
      alert("Rating removed!");
    } catch (err) {
      console.error(err);
      alert("Failed to remove rating.");
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
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #00d8ff', display: 'inline-block' }}>
        <h3>Rate this movie:</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star} 
              onClick={() => handleRateMovie(star)}
              style={{ 
                fontSize: '2rem', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                color: star <= userRating ? 'gold' : 'gray' 
              }}
            >
              ★
            </button>
          ))}

          {/* NEW: Only show the delete button if they have an active rating! */}
          {userRating > 0 && (
            <button 
              onClick={handleDeleteRating}
              style={{
                marginLeft: '15px',
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Remove Rating
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;