import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const lightTheme = {
  mode: 'light',
  background: '#f5f5f5',
  surface: '#ffffff',
  surfaceAlt: '#f0f0f0',
  text: '#222',
  secondaryText: '#666',
  border: '#ddd',
  inputBackground: '#ffffff',
  inputText: '#222',
  placeholder: '#eee',
};

const darkTheme = {
  mode: 'dark',
  background: '#111',
  surface: '#1a1a1a',
  surfaceAlt: '#222',
  text: '#fff',
  secondaryText: '#aaa',
  border: '#333',
  inputBackground: '#222',
  inputText: '#fff',
  placeholder: '#222',
};

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const theme = darkMode ? darkTheme : lightTheme;

    localStorage.setItem('theme', darkMode ? 'dark' : 'light');

    document.documentElement.dataset.theme = theme.mode;
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.text;
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ darkMode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
