// src/components/MovieCard.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link

function MovieCard({ movie }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', width: '200px' }}>
      {/* Wrap the image and title in a Link! */}
      {/* We dynamically build the URL using the movie's ID */}
      <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {movie.poster_path ? (
             <img 
               src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
               alt={`${movie.title} poster`} 
               style={{ width: '100%' }}
             />
          ) : (
             <div style={{ height: '300px', backgroundColor: '#eee', display: 'flex', alignItems:'center', justifyContent:'center'}}>No Image</div>
          )}
          <h3 style={{ fontSize: '1.2rem', margin: '10px 0' }}>{movie.title}</h3>
      </Link>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
         Released: {movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}
      </p>
    </div>
  );
}

export default MovieCard;