import React, { useState } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';

function Search() {
  // 1. STATE VARIABLES
  // We need to store what the user types in the input box
  const [searchQuery, setSearchQuery] = useState('');
  // We need an array to store the movies returned from TMDB
  const [movies, setMovies] = useState([]);
  // We need a loading state so we can show a spinner while waiting for the API
  const [isLoading, setIsLoading] = useState(false);
  // We need to store any errors if the API request fails
  const [error, setError] = useState(null);

  // 2. THE SEARCH FUNCTION
  // We use "async" because this function will talk to a server over the internet
  const handleSearch = async (e) => {
    // Prevent the form from refreshing the page (default HTML behavior)
    e.preventDefault();

    // If the user submits an empty search, do nothing
    if (!searchQuery.trim()) return;

    setIsLoading(true); // Start loading!
    setError(null);     // Clear any old errors

    try {
      // 3. THE API CALL
      // We "await" the response from Axios. 
      // Notice we pass our query and API key in the URL.
      const response = await axios.get(
        `https://api.themoviedb.org/3/search/movie?query=${searchQuery}&api_key=${import.meta.env.VITE_TMDB_API_KEY}`
      );

      // TMDB puts the list of movies inside an array called 'results'
      setMovies(response.data.results);
      
    } catch (err) {
      // If the internet is down or the API key is wrong, this catch block runs.
      console.error("Error fetching data:", err);
      setError("Failed to fetch movies. Please try again.");
    } finally {
      // Whether it succeeded or failed, we are done loading.
      setIsLoading(false); 
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Search Movies</h1>
      
      {/* 4. THE SEARCH FORM */}
      <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Search for a movie..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update state as user types
          style={{ padding: '0.5rem', width: '300px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Search</button>
      </form>

      {/* Conditional Rendering: Show loading, error, or results */}
      {isLoading && <p>Loading movies...</p>}
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 5. DISPLAYING THE RESULTS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie}/>
        ))}
      </div>
      
    </div>
  );
}

export default Search;