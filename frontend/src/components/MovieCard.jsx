import React from 'react';
import { Link } from 'react-router-dom';

function MovieCard({ movie }) {
  return (
    // Changed width from '200px' to '100%' so the grid can control its size!
    <div style={{ border: '1px solid #333', padding: '1rem', width: '100%', boxSizing: 'border-box', borderRadius: '8px', background: '#1a1a1a' }}>
      <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {movie.poster_path ? (
             <img 
               src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
               alt={`${movie.title} poster`} 
               style={{ width: '100%', borderRadius: '4px', display: 'block' }}
             />
          ) : (
             <div style={{ height: '300px', backgroundColor: '#222', display: 'flex', alignItems:'center', justifyContent:'center', borderRadius: '4px' }}>No Image</div>
          )}
          <h3 style={{ fontSize: '1.1rem', margin: '12px 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</h3>
      </Link>
      <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>
         Released: {movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}
      </p>
    </div>
  );
}

export default MovieCard;