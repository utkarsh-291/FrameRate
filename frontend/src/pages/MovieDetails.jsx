// src/pages/MovieDetails.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
// import { useParams } from 'react-router-dom'; // Hook to grab the ID from the URL
import axios from 'axios';

function MovieDetails() {

  // 1. Grab the 'id' from the URL (e.g., if URL is /movie/27205, id = '27205')
  const { id } = useParams(); 

  const [movie, setMovie] = useState(null); // Note: Initial state is null, not an empty array!
  const [isLoading, setIsLoading] = useState(true); // Start loading immediately
  const [userRating, setUserRating] = useState(0); 
  const [error, setError] = useState(null);

  // 2. The useEffect Hook
  useEffect(() => {
    // We define the async function inside the useEffect
    const fetchMovieDetails = async () => {
      try {
        // We use the ID from the URL to ask TMDB for specific details
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=import.meta.env.VITE_TMDB_API_KEY`
        );
        // TMDB returns a single movie object, not an array of results
        setMovie(response.data);
      } catch (err) {
        console.error("Error fetching details:", err);
        setError("Failed to load movie details.");
      } finally {
        setIsLoading(false);
      }
    };

    // Call the function immediately when the component mounts
    fetchMovieDetails();
    
  // The Dependency Array [id]: 
  // Tells React to re-run this effect ONLY if the 'id' in the URL changes.
  }, [id]); 

  const handleRateMovie = async (stars) => {
    const token = localStorage.getItem('token');

    if(!token) {
      alert("You must be logged in to rate a movie!");
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/ratings', 
        { movieId: id, rating: stars },
        { headers: { Authorization: `Bearer ${token}` } } // Presenting the VIP Wristband
      );
    setUserRating(stars); // Update the UI so the stars light up
      alert("Rating saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save rating. Did you already rate this?");
    }
  };

  // 3. Render loading or error states first
  if (isLoading) return <div style={{ padding: '2rem' }}>Loading details...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  if (!movie) return <div style={{ padding: '2rem' }}>Movie not found.</div>;

  // 4. Render the movie details!
  return (
    <div style={{ 
      padding: '2rem', 
      minHeight: '100vh',
      // 1. We check if backdrop_path exists, then build the URL. Otherwise, use a fallback color.
      backgroundImage: movie.backdrop_path 
        ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` 
        : '#111', // Dark fallback background if no backdrop exists
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'white' // Making text white so it pops against the dark background!
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
          <p><strong>Genres:</strong> {movie.genres.map(g => g.name).join(', ')}</p>
          
          <h3 style={{ marginTop: '1.5rem' }}>Overview</h3>
          <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>{movie.overview}</p>
        </div>
      </div>
      <h1>{movie.title}</h1>
      <p>{movie.overview}</p>
      
      {/* NEW: The Star Rating UI */}
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #00d8ff', display: 'inline-block' }}>
        <h3>Rate this movie:</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Create 5 buttons for the 5 stars */}
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star} 
              onClick={() => handleRateMovie(star)}
              style={{ 
                fontSize: '2rem', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                // Change color if this star is less than or equal to the chosen rating
                color: star <= userRating ? 'gold' : 'gray' 
              }}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;