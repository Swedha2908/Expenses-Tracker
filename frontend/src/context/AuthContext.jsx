import { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Fetch the full user profile from the backend
  const fetchUser = async () => {
    try {
      const { data } = await api.get('/users/me');
      setUser(data); // data contains { id, name, email, created_at }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      logout(); // If the token is invalid/expired, log them out
    } finally {
      setLoading(false);
    }
  };

  // Run fetchUser whenever the token changes
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const { data } = await api.post('/login', formData);
    
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    // fetchUser will automatically be triggered by the useEffect above
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {/* Only render children when we are done checking authentication */}
      {!loading && children}
    </AuthContext.Provider>
  );
};