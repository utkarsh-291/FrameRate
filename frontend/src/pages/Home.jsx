import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';

function Home() {
  const [displayedMovies, setDisplayedMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // NEW: Track the current page number and separate loading states
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);         // For initial page 1 load
  const [isLoadingMore, setIsLoadingMore] = useState(false); // For loading subsequent pages
  const [error, setError] = useState(null);

  // Core fetch function that handles both Page 1 resets and Page 2+ appends
  const fetchMovies = async (targetPage, searchMode, query) => {
    if (targetPage === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    
    setError(null);

    try {
      const endpoint = searchMode
        ? `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&page=${targetPage}&api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        : `https://api.themoviedb.org/3/trending/movie/week?page=${targetPage}&api_key=${import.meta.env.VITE_TMDB_API_KEY}`;
      
      const response = await axios.get(endpoint);
      const newMovies = response.data.results;

      if (targetPage === 1) {
        // If it's the first page, replace the grid entirely
        setDisplayedMovies(newMovies);
      } else {
        // THE MAGIC: Spread operator appends new movies to the end of the existing list!
        setDisplayedMovies((prevMovies) => [...prevMovies, ...newMovies]);
      }
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Failed to load movies. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 1. Initial load when opening the website
  useEffect(() => {
    fetchMovies(1, false, '');
  }, []);

  // 2. Handle a new search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      handleClearSearch();
      return;
    }
    setIsSearchMode(true);
    setPage(1); // Reset back to page 1 for a new search
    fetchMovies(1, true, searchQuery);
  };

  // 3. Clear search and return to trending
  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchMode(false);
    setPage(1); // Reset back to page 1 of trending
    fetchMovies(1, false, '');
  };

  // 4. NEW: The unlimited feed trigger!
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(nextPage, isSearchMode, searchQuery);
  };

  return (
    <div style={{ padding: '2rem', color: 'white', backgroundColor: '#111', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Hero Banner with Integrated Search */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '3rem', 
        padding: '3rem 1rem', 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #00d8ff22 100%)', 
        borderRadius: '12px',
        border: '1px solid #222',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', color: '#00d8ff', fontWeight: 'bold' }}>Explore FrameRate</h1>
        <p style={{ fontSize: '1.2rem', color: '#ccc', margin: '0 0 2rem 0' }}>Discover new releases, search your favorites, and track your personal ratings.</p>

        <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', gap: '10px', maxWidth: '550px', margin: '0 auto', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search for any movie..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              flex: 1, 
              minWidth: '220px',
              padding: '12px 16px', 
              borderRadius: '6px', 
              border: '1px solid #444', 
              background: '#222', 
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            style={{ padding: '12px 24px', background: '#00d8ff', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
          >
            Search
          </button>
          
          {isSearchMode && (
            <button 
              type="button" 
              onClick={handleClearSearch}
              style={{ padding: '12px 16px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
            >
              ✕ Clear
            </button>
          )}
        </form>
      </div>

      {/* Dynamic Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0 }}>
          {isSearchMode ? `🔍 Search Results for "${searchQuery}"` : "🔥 Trending This Week"}
        </h2>
        {isSearchMode && (
          <span onClick={handleClearSearch} style={{ color: '#00d8ff', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline', fontWeight: '500' }}>
            ← Back to Trending
          </span>
        )}
      </div>

      {error && <p style={{ color: '#ff4d4d', marginTop: '1rem' }}>{error}</p>}
      
      {/* Page 1 Loading Spinner */}
      {isLoading ? (
        <p style={{ marginTop: '2rem', color: '#ccc' }}>Loading movies...</p>
      ) : (
        <>
          {/* Movie Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '1.5rem', width: '100%' }}>
            {displayedMovies.length > 0 ? (
              displayedMovies.map((movie, index) => (
                /* Use movie.id + index as the key in case TMDB ever returns a duplicate across pages */
                <MovieCard key={`${movie.id}-${index}`} movie={movie} />
              ))
            ) : (
              <p style={{ color: '#888', gridColumn: '1 / -1', marginTop: '1rem' }}>No movies found.</p>
            )}
          </div>

          {/* NEW: Unlimited Feed "Load More" Button */}
          {displayedMovies.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '2rem' }}>
              <button 
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                style={{
                  padding: '14px 32px',
                  backgroundColor: isLoadingMore ? '#222' : '#1a1a1a',
                  color: isLoadingMore ? '#666' : '#00d8ff',
                  border: '1px solid #00d8ff',
                  borderRadius: '30px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(0, 216, 255, 0.1)'
                }}
              >
                {isLoadingMore ? "Loading 20 more movies..." : "⬇ Load More Movies"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;