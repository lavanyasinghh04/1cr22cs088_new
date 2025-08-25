import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import URLShortener from './components/URLShortener';
import URLStatistics from './components/URLStatistics';
import AuthManager from './components/AuthManager';
import config from './config';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="container">
            <h1 className="navbar-brand">URL Shortener</h1>
            <div className="navbar-nav">
              {isAuthenticated && (
                <>
                  <Link to="/" className="nav-link">Shorten URLs</Link>
                  <Link to="/statistics" className="nav-link">Statistics</Link>
                </>
              )}
            </div>
          </div>
        </nav>
        
        <main className="main-content">
          <div className="container">
            <AuthManager onAuthChange={setIsAuthenticated} />
            
            {isAuthenticated ? (
              <Routes>
                <Route path="/" element={<URLShortener />} />
                <Route path="/statistics" element={<URLStatistics />} />
                <Route path="/:shortcode" element={<URLRedirect />} />
              </Routes>
            ) : (
              <div className="auth-required">
                <p>Please login to access the URL Shortener service.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </Router>
  );
}

// Component to handle URL redirection
function URLRedirect() {
  const { shortcode } = useParams();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    const redirectToBackend = () => {
      // Redirect to backend for handling
      const backendUrl = config.API_BASE_URL;
      window.location.replace(`${backendUrl}/${shortcode}`);
    };

    // Try to redirect through backend first
    redirectToBackend();
  }, [shortcode, navigate]);
  
  return <div>Redirecting...</div>;
}

export default App;
