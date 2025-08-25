import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import loggingService from '../services/loggingService';
import './AuthManager.css';

const AuthManager = ({ onAuthChange }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuthentication = () => {
      const storedToken = apiService.getStoredToken();
      if (storedToken && !apiService.isTokenExpired()) {
        setIsAuthenticated(true);
        setToken(storedToken);
        extractUserInfo(storedToken);
        if (onAuthChange) onAuthChange(true);
        loggingService.log('frontend', 'info', 'auth', 'User authenticated successfully');
      } else {
        setIsAuthenticated(false);
        setToken('');
        setUserInfo(null);
        if (onAuthChange) onAuthChange(false);
        loggingService.log('frontend', 'warn', 'auth', 'User not authenticated or token expired');
      }
    };

    // Check if user is already authenticated on component mount
    checkAuthentication();
  }, [onAuthChange]);

  const extractUserInfo = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserInfo({
        name: payload.name,
        email: payload.email,
        rollNo: payload.rollNo,
        exp: new Date(payload.exp * 1000).toLocaleString()
      });
    } catch (error) {
      console.error('Error extracting user info:', error);
    }
  };

  const handleLogin = () => {
    setIsLoading(true);
    
    // Use the provided token
    const providedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVdIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJsYXNpMjJjc0BjbXJpdC5hYy5pbiIsImV4cCI6MTc1NjA5NTExMywiaWF0IjoxNzU2MDk0MjEzLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZjg0M2U5MjUtMjhkMC00Y2M1LTk2NmMtMmI1YTQ1NmEyYTBmIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibGF2YW55YSBzaW5naCIsInN1YiI6IjE0NDY2Y2FlLTgzYzAtNGYxOS05YjczLWRiNGVhYjFiYTUxYiJ9LCJlbWFpbCI6Imxhc2kyMmNzQGNtcml0LmFjLmluIiwibmFtZSI6ImxhdmFueWEgc2luZ2giLCJyb2xsTm8iOiIxY3IyMmNzMDg4IiwiYWNjZXNzQ29kZSI6InlVVlFYSyIsImNsaWVudElEIjoiMTQ0NjZjYWUtODNjMC00ZjE5LTliNzMtZGI0ZWFiMWJhNTFiIiwiY2xpZW50U2VjcmV0IjoibVlkdGRXbWNCYWV1eXRIQiJ9.zypKptktYtJfzMfM7ZSogDNQVxsn3d7FFsp7LdD_aN0";
    
    apiService.storeToken(providedToken);
    setToken(providedToken);
    setIsAuthenticated(true);
    extractUserInfo(providedToken);
    
    loggingService.log('frontend', 'info', 'auth', 'User logged in successfully');
    
    if (onAuthChange) onAuthChange(true);
    setIsLoading(false);
  };

  const handleLogout = () => {
    apiService.clearToken();
    setIsAuthenticated(false);
    setToken('');
    setUserInfo(null);
    loggingService.log('frontend', 'info', 'auth', 'User logged out successfully');
    if (onAuthChange) onAuthChange(false);
  };

  if (isAuthenticated) {
    return (
      <div className="auth-manager">
        <div className="user-info">
          <div className="user-details">
            <span className="user-name">{userInfo?.name}</span>
            <span className="user-email">{userInfo?.email}</span>
            <span className="user-roll">Roll: {userInfo?.rollNo}</span>
            <span className="token-expiry">Expires: {userInfo?.exp}</span>
          </div>
          <button 
            className="btn btn-danger logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-manager">
      <div className="login-section">
        <h3>Authentication Required</h3>
        <p>Please login to use the URL Shortener service</p>
        <button 
          className="btn btn-primary login-btn"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login with Provided Token'}
        </button>
      </div>
    </div>
  );
};

export default AuthManager;
