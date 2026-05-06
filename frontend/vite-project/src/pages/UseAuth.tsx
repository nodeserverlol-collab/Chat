import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const checkAuth = () => {
    const token = getCookie('authToken');
    const username = getCookie('username');
    const userId = getCookie('userId');

    if (token && token !== 'undefined') {
      setIsAuthenticated(true);
      setUser({ username, userId });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { isAuthenticated, user, loading };
}