import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { useTheme } from '../context/ThemeContext';

function Profile() {
  const { theme, darkMode } = useTheme();
  const [ratedMovies, setRatedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ratings');
  const navigate = useNavigate();

  const [aiRecs, setAiRecs] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchUserRatings = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const dbResponse = await axios.get(
          'https://framerate-bfy0.onrender.com/api/ratings',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

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

          return {
            ...tmdbRes.data,
            userRating: item.rating
          };
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
    if (
      !window.confirm(
        "Are you sure? This will permanently wipe your account and all movie ratings!"
      )
    ) {
      return;
    }

    const token = localStorage.getItem('token');

    try {
      await axios.delete(
        'https://framerate-bfy0.onrender.com/api/account',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      localStorage.removeItem('token');
      alert("Account deleted.");
      navigate('/');

    } catch (err) {
      alert("Failed to delete account.");
    }
  };

  const handleGetRecommendations = async () => {
    if (ratedMovies.length === 0) return;

    setIsGenerating(true);
    setAiRecs([]);

    const token = localStorage.getItem('token');

    try {
      const res = await axios.post(
        'https://framerate-bfy0.onrender.com/api/recommendations',
        { ratedMovies: ratedMovies },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAiRecs(res.data.recommendations);

    } catch (err) {
      console.error(err);

      const realErrorMessage =
        err.response?.data?.error || err.message;

      alert("AI Error: " + realErrorMessage);

    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          padding: '2rem',
          color: theme.text,
          backgroundColor: theme.background,
          minHeight: '100vh'
        }}
      >
        Loading your profile...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '2rem',
        color: theme.text,
        backgroundColor: theme.background,
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
        textAlign: 'left'
      }}
    >

      <h1
        style={{
          borderBottom: `1px solid ${theme.border}`,
          paddingBottom: '1rem',
          margin: '0 0 1.5rem 0'
        }}
      >
        My Profile
      </h1>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          margin: '0 0 2rem 0',
          borderBottom: `2px solid ${theme.border}`
        }}
      >
        <button
          onClick={() => setActiveTab('ratings')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            color: activeTab === 'ratings' ? '#00a8cc' : theme.secondaryText,
            borderBottom:
              activeTab === 'ratings'
                ? '2px solid #00d8ff'
                : 'none',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}
        >
        My Rated Movies ({ratedMovies.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            color: activeTab === 'settings' ? '#dc3545' : theme.secondaryText,
            borderBottom:
              activeTab === 'settings'
                ? '2px solid #dc3545'
                : 'none',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}
        >
        Account Settings
        </button>
      </div>

      {/* TAB 1: RATINGS */}
      {activeTab === 'ratings' && (
        <div>

          {/* Header Bar with AI Button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <h2 style={{ margin: 0 }}>
              Your Library
            </h2>

            {ratedMovies.length > 0 && (
              <button
                onClick={handleGetRecommendations}
                disabled={isGenerating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isGenerating
                    ? theme.surfaceAlt
                    : '#aa3bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  fontWeight: 'bold',
                  cursor: isGenerating ? 'wait' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow:
                    '0 4px 15px rgba(170, 59, 255, 0.2)'
                }}
              >
                {isGenerating
                  ? "Gemini is analyzing your taste..."
                  : "Ask AI What To Watch Next"}
              </button>
            )}
          </div>

          {/* AI Recommendation Cards */}
          {aiRecs.length > 0 && (
            <div
              style={{
                marginBottom: '3rem',
                background: theme.surface,
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(170, 59, 255, 0.4)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  borderBottom:
                    '1px solid rgba(170, 59, 255, 0.2)',
                  paddingBottom: '10px'
                }}
              >
                <h3
                  style={{
                    color: '#aa3bff',
                    margin: 0,
                    fontSize: '1.3rem'
                  }}
                >
                Top 3 AI Picks For You
                </h3>

                <button
                  onClick={() => setAiRecs([])}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.secondaryText,
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Grid of AI Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px'
                }}
              >
                {aiRecs.map((rec, index) => (
                  <div
                    key={index}
                    style={{
                      background:
                        (darkMode ? '#241b33' : '#f5f0ff'),
                      border: '1px solid #aa3bff66',
                      borderRadius: '10px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow:
                        '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div>

                      {/* Vibe Badge */}
                      <span
                        style={{
                          background:
                            'rgba(170, 59, 255, 0.15)',
                          color: '#8b3dcc',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          letterSpacing: '0.5px',
                          display: 'inline-block',
                          marginBottom: '12px'
                        }}
                      >
                        ✨ {rec.vibe}
                      </span>

                      {/* Title & Year */}
                      <h4
                        style={{
                          margin: '0 0 5px 0',
                          fontSize: '1.3rem',
                          color: theme.text
                        }}
                      >
                        {rec.title}{' '}
                        <span
                          style={{
                            fontSize: '0.9rem',
                            color: theme.secondaryText,
                            fontWeight: 'normal'
                          }}
                        >
                          ({rec.year})
                        </span>
                      </h4>

                      {/* Genre */}
                      <p
                        style={{
                          color: '#009bbd',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          margin: '0 0 12px 0'
                        }}
                      >
                        {rec.genre}
                      </p>

                      {/* Why Explanation */}
                      <p
                        style={{
                          color: darkMode ? '#ddd' : '#444',
                          fontSize: '0.95rem',
                          lineHeight: '1.5',
                          margin: '0 0 15px 0',
                          fontStyle: 'italic',
                          background: darkMode ? '#222' : '#f5f5f5',
                          padding: '10px',
                          borderRadius: '6px',
                          borderLeft:
                            '3px solid #aa3bff'
                        }}
                      >
                        "{rec.reason}"
                      </p>

                    </div>

                    {/* Search Link */}
                    <Link
                      to={`/?search=${encodeURIComponent(rec.title)}`}
                      style={{
                        textAlign: 'center',
                        background: theme.surfaceAlt,
                        color: theme.text,
                        padding: '10px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        border: `1px solid ${theme.border}`,
                        transition: 'background 0.2s'
                      }}
                    >
                    Search Movie in App
                    </Link>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Movie Grid */}
          {ratedMovies.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem',
                background: theme.surface,
                borderRadius: '8px',
                border: `1px solid ${theme.border}`
              }}
            >
              <p
                style={{
                  fontSize: '1.2rem',
                  color: theme.secondaryText
                }}
              >
                You haven't rated any movies yet.
              </p>

              <Link
                to="/"
                style={{
                  display: 'inline-block',
                  marginTop: '15px',
                  padding: '10px 20px',
                  background: '#00d8ff',
                  color: '#000',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  fontWeight: 'bold'
                }}
              >
                Find Movies to Rate
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px',
                width: '100%'
              }}
            >
              {ratedMovies.map((movie, index) => (
                <div
                  key={`${movie.id}-${index}`}
                  style={{
                    position: 'relative',
                    width: '100%'
                  }}
                >
                  <MovieCard movie={movie} />

                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'gold',
                      color: 'black',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontWeight: 'bold',
                      boxShadow:
                        '0 2px 5px rgba(0,0,0,0.25)'
                    }}
                  >
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
        <div
          style={{
            background: theme.surface,
            padding: '2rem',
            borderRadius: '8px',
            border: '1px solid #e5b5b5',
            maxWidth: '600px'
          }}
        >
  

          <p
            style={{
              color: theme.secondaryText,
              lineHeight: '1.5'
            }}
          >
            Deleting your account will permanently remove your
            email, password hash, and every star rating you have
            ever submitted on FrameRate. This action cannot be
            undone.
          </p>

          <button
            onClick={handleDeleteAccount}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginTop: '1.5rem'
            }}
          >
            Permanently Delete My Account
          </button>
        </div>
      )}

    </div>
  );
}

export default Profile;