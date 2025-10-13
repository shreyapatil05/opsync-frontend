import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import apiClient from '../utils/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const refreshTimeoutRef = useRef(null);

 
  const scheduleTokenRefresh = (expiresIn = 15) => {
    
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    
    const refreshTime = (expiresIn * 60 - 60) * 1000;
    console.log(` Scheduling token refresh in ${Math.floor(refreshTime / 1000)} seconds`);

    refreshTimeoutRef.current = setTimeout(() => {
      refreshAccessToken();
    }, refreshTime);
  };

  
  const refreshAccessToken = async () => {
    try {
      console.log(" Attempting to refresh access token...");
      const response = await fetch('http://https://opsync.onrender.com/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Token refreshed successfully");
        setUser(data.user);
        setIsLoggedIn(true);
        
        scheduleTokenRefresh(15); 
      } else if (response.status === 401) {
        console.log(" Refresh token expired, logging out...");
        handleLogout();
      } else {
        console.error("Token refresh failed:", response.status);
      }
    } catch (error) {
      console.error(" Token refresh error:", error);
    }
  };


  const checkAuthStatus = async () => {
    try {
      console.log(" Checking initial auth status...");
      const response = await apiClient.get('/auth/profile');

      if (!response) {
        console.log(" No response from server");
        handleLogout();
        return;
      }

      console.log(` Auth check response status: ${response.status}`);

      if (response.status === 401) {
        console.log(" Access token invalid (401), attempting refresh...");
        
        await refreshAccessToken();
        return;
      }

      if (response.ok) {
        const userData = await response.json();
        console.log(" User authenticated:", userData.name);
        setUser(userData);
        setIsLoggedIn(true);
        
        scheduleTokenRefresh(15);
      } else {
        console.log(" Auth check failed with status:", response.status);
        if (response.status === 401 || response.status === 403) {
          handleLogout();
        }
      }
    } catch (error) {
      console.error(" Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    console.log(" Handling logout in AuthContext");
    
    
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    setUser(null);
    setIsLoggedIn(false);

    if (!window.location.pathname.includes('/login')) {
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  };

  
  useEffect(() => {
    checkAuthStatus();

   
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  
  const login = (userData) => {
    console.log(" Logging in user:", userData.name);
    setUser(userData);
    setIsLoggedIn(true);
    
    scheduleTokenRefresh(15);
  };

 
  const logout = async () => {
    try {
      console.log(" User initiated logout...");
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error(" Logout error:", error);
    } finally {
      handleLogout();
    }
  };

  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    logout,
    checkAuthStatus,
    refreshAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}