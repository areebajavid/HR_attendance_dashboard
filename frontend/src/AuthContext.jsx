import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        // Log the error response from the server for better debugging
        const errorData = await response.json();
        console.error('Login failed:', errorData.error);
        return false;
      }

      const data = await response.json();
      setToken(data.token);
      return true;
    } catch (error) {
      console.error('A network error occurred during login:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
  };

  const value = { token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}