import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import loggingService from '../services/loggingService';
import './URLShortener.css';

const URLShortener = () => {
  const [urls, setUrls] = useState([
    { originalURL: '', validityPeriod: '', preferredShortcode: '', errors: {} }
  ]);
  const [shortenedURLs, setShortenedURLs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing shortened URLs from backend
  useEffect(() => {
    loadShortenedURLs();
  }, []);

  const loadShortenedURLs = async () => {
    try {
      const urls = await apiService.getAllShortenedURLs();
      setShortenedURLs(urls);
      loggingService.log('frontend', 'info', 'urlShortener', 'Successfully loaded shortened URLs from backend');
    } catch (error) {
      console.error('Failed to load URLs:', error);
      loggingService.log('frontend', 'error', 'urlShortener', 'Failed to load URLs from backend');
      // Fallback to localStorage if backend is not available
      const savedURLs = JSON.parse(localStorage.getItem('shortenedURLs') || '[]');
      setShortenedURLs(savedURLs);
    }
  };

  // URL validation function
  const validateURL = (url) => {
    const urlPattern = /^https?:\/\/.+/;
    return urlPattern.test(url);
  };

  // Generate random shortcode
  const generateShortcode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Check if shortcode is unique
  const isShortcodeUnique = (shortcode) => {
    return !shortenedURLs.some(url => url.shortcode === shortcode);
  };

  // Add new URL input
  const addURL = () => {
    if (urls.length < 5) {
      setUrls([...urls, { originalURL: '', validityPeriod: '', preferredShortcode: '', errors: {} }]);
    }
  };

  // Remove URL input
  const removeURL = (index) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  // Update URL input
  const updateURL = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index] = { ...newUrls[index], [field]: value, errors: {} };
    setUrls(newUrls);
  };

  // Validate all URLs
  const validateURLs = () => {
    let isValid = true;
    const newUrls = urls.map(url => {
      const errors = {};
      
      if (!url.originalURL.trim()) {
        errors.originalURL = 'Original URL is required';
        isValid = false;
      } else if (!validateURL(url.originalURL)) {
        errors.originalURL = 'Please enter a valid URL (must start with http:// or https://)';
        isValid = false;
      }

      if (url.validityPeriod && (isNaN(url.validityPeriod) || parseInt(url.validityPeriod) <= 0)) {
        errors.validityPeriod = 'Validity period must be a positive number';
        isValid = false;
      }

      if (url.preferredShortcode) {
        if (!/^[a-zA-Z0-9]+$/.test(url.preferredShortcode)) {
          errors.preferredShortcode = 'Shortcode can only contain letters and numbers';
          isValid = false;
        } else if (!isShortcodeUnique(url.preferredShortcode)) {
          errors.preferredShortcode = 'This shortcode is already in use';
          isValid = false;
        }
      }

      return { ...url, errors };
    });

    setUrls(newUrls);
    return isValid;
  };

  // Shorten URLs
  const shortenURLs = async () => {
    if (!validateURLs()) {
      loggingService.log('frontend', 'warn', 'urlShortener', 'URL validation failed');
      return;
    }

    setIsLoading(true);
    loggingService.log('frontend', 'info', 'urlShortener', 'Starting URL shortening process');

    try {
      const newShortenedURLs = [];
      
      for (const url of urls) {
        if (!url.originalURL.trim()) continue;

        try {
          // Call backend API to create shortened URL
          const response = await apiService.createShortenedURL(url);
          
          const shortenedURL = {
            id: Date.now() + Math.random(),
            originalURL: url.originalURL,
            shortcode: response.shortcode,
            shortenedURL: response.shortlink,
            createdAt: new Date().toISOString(),
            expiryDate: response.expiry,
            clickCount: 0,
            clicks: []
          };

          newShortenedURLs.push(shortenedURL);
          loggingService.log('frontend', 'info', 'urlShortener', `Successfully shortened URL: ${url.originalURL} to ${response.shortcode}`);
        } catch (apiError) {
          console.error('API error for URL:', url.originalURL, apiError);
          loggingService.log('frontend', 'error', 'urlShortener', `API error for URL: ${url.originalURL}`);
          // Fallback to local generation if API fails
          let shortcode = url.preferredShortcode;
          if (!shortcode) {
            do {
              shortcode = generateShortcode();
            } while (!isShortcodeUnique(shortcode));
          }

          const validityPeriodMinutes = url.validityPeriod ? parseInt(url.validityPeriod) : 30;
          const expiryDate = new Date(Date.now() + validityPeriodMinutes * 60 * 1000).toISOString();

          const shortenedURL = {
            id: Date.now() + Math.random(),
            originalURL: url.originalURL,
            shortcode,
            shortenedURL: `${window.location.origin}/${shortcode}`,
            createdAt: new Date().toISOString(),
            expiryDate,
            clickCount: 0,
            clicks: []
          };
          loggingService.log('frontend', 'warn', 'urlShortener', `Used fallback shortening for URL: ${url.originalURL}`);

          newShortenedURLs.push(shortenedURL);
        }
      }

      // Update state and localStorage as fallback
      const updatedURLs = [...shortenedURLs, ...newShortenedURLs];
      setShortenedURLs(updatedURLs);
      localStorage.setItem('shortenedURLs', JSON.stringify(updatedURLs));

      // Reset form
      setUrls([{ originalURL: '', validityPeriod: '', preferredShortcode: '', errors: {} }]);
      
      alert('URLs shortened successfully!');
      loggingService.log('frontend', 'info', 'urlShortener', 'URL shortening completed successfully');
    } catch (error) {
      console.error('Error shortening URLs:', error);
      loggingService.log('frontend', 'error', 'urlShortener', 'Error shortening URLs');
      alert('Error shortening URLs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear form
  const clearForm = () => {
    setUrls([{ originalURL: '', validityPeriod: '', preferredShortcode: '', errors: {} }]);
  };

  return (
    <div className="url-shortener">
      <div className="card">
        <h2 className="card-title">Shorten URLs</h2>
        <p className="card-subtitle">You can shorten up to 5 URLs at once</p>
        
        <div className="url-form">
          {urls.map((url, index) => (
            <div key={index} className="url-input-group">
              <div className="form-group">
                <label className="form-label">Original URL *</label>
                <input
                  type="url"
                  className={`form-input ${url.errors.originalURL ? 'error' : ''}`}
                  placeholder="https://example.com"
                  value={url.originalURL}
                  onChange={(e) => updateURL(index, 'originalURL', e.target.value)}
                />
                {url.errors.originalURL && (
                  <div className="error-message">{url.errors.originalURL}</div>
                )}
              </div>

                             <div className="form-group">
                 <label className="form-label">Validity Period (minutes)</label>
                 <input
                   type="number"
                   className={`form-input ${url.errors.validityPeriod ? 'error' : ''}`}
                   placeholder="Optional (default: 30 min)"
                   value={url.validityPeriod}
                   onChange={(e) => updateURL(index, 'validityPeriod', e.target.value)}
                 />
                 {url.errors.validityPeriod && (
                   <div className="error-message">{url.errors.validityPeriod}</div>
                 )}
               </div>

              <div className="form-group">
                <label className="form-label">Preferred Shortcode</label>
                <input
                  type="text"
                  className={`form-input ${url.errors.preferredShortcode ? 'error' : ''}`}
                  placeholder="Optional"
                  value={url.preferredShortcode}
                  onChange={(e) => updateURL(index, 'preferredShortcode', e.target.value)}
                />
                {url.errors.preferredShortcode && (
                  <div className="error-message">{url.errors.preferredShortcode}</div>
                )}
              </div>

              {urls.length > 1 && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeURL(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <div className="actions">
            {urls.length < 5 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addURL}
              >
                Add Another URL
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearForm}
            >
              Clear Form
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={shortenURLs}
              disabled={isLoading}
            >
              {isLoading ? 'Shortening...' : 'Shorten URLs'}
            </button>
          </div>
        </div>
      </div>

      {shortenedURLs.length > 0 && (
        <div className="card">
          <h3 className="card-title">Recently Shortened URLs</h3>
          <div className="url-list">
            {shortenedURLs.slice(0, 5).map((url) => (
              <div key={url.id} className="url-item">
                <div className="url-item-header">
                  <div className="url-original">{url.originalURL}</div>
                  <div className="url-shortened">{url.shortenedURL}</div>
                </div>
                <div className="url-stats">
                  <span>Clicks: {url.clickCount}</span>
                  <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
                  {url.expiryDate && (
                    <span>Expires: {new Date(url.expiryDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default URLShortener;
