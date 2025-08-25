import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import loggingService from '../services/loggingService';
import './URLStatistics.css';

const URLStatistics = () => {
  const [shortenedURLs, setShortenedURLs] = useState([]);
  const [selectedURL, setSelectedURL] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load shortened URLs from backend
  useEffect(() => {
    loadShortenedURLs();
  }, []);

  const loadShortenedURLs = async () => {
    try {
      const urls = await apiService.getAllShortenedURLs();
      setShortenedURLs(urls);
      loggingService.log('frontend', 'info', 'urlStatistics', 'Successfully loaded URL statistics from backend');
    } catch (error) {
      console.error('Failed to load URLs from backend:', error);
      loggingService.log('frontend', 'error', 'urlStatistics', 'Failed to load URL statistics from backend');
      // Fallback to localStorage if backend is not available
      const savedURLs = JSON.parse(localStorage.getItem('shortenedURLs') || '[]');
      setShortenedURLs(savedURLs);
    }
  };

  // Filter URLs based on search term
  const filteredURLs = shortenedURLs.filter(url => 
    url.originalURL.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.shortcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total statistics
  const totalStats = {
    totalURLs: shortenedURLs.length,
    totalClicks: shortenedURLs.reduce((sum, url) => sum + url.clickCount, 0),
    activeURLs: shortenedURLs.filter(url => 
      !url.expiryDate || new Date() < new Date(url.expiryDate)
    ).length,
    expiredURLs: shortenedURLs.filter(url => 
      url.expiryDate && new Date() > new Date(url.expiryDate)
    ).length
  };

  // Delete URL
  const deleteURL = (urlId) => {
    if (window.confirm('Are you sure you want to delete this URL?')) {
      const updatedURLs = shortenedURLs.filter(url => url.id !== urlId);
      setShortenedURLs(updatedURLs);
      // Update localStorage as fallback
      localStorage.setItem('shortenedURLs', JSON.stringify(updatedURLs));
      setSelectedURL(null);
      loggingService.log('frontend', 'info', 'urlStatistics', 'URL deleted successfully');
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('URL copied to clipboard!');
      loggingService.log('frontend', 'info', 'urlStatistics', 'URL copied to clipboard successfully');
    }).catch(() => {
      alert('Failed to copy URL');
      loggingService.log('frontend', 'error', 'urlStatistics', 'Failed to copy URL to clipboard');
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Check if URL is expired
  const isExpired = (url) => {
    return url.expiryDate && new Date() > new Date(url.expiryDate);
  };

  return (
    <div className="url-statistics">
      <div className="card">
        <h2 className="card-title">URL Statistics</h2>
        
        {/* Summary Statistics */}
        <div className="stats-summary">
          <div className="stat-item">
            <div className="stat-number">{totalStats.totalURLs}</div>
            <div className="stat-label">Total URLs</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{totalStats.totalClicks}</div>
            <div className="stat-label">Total Clicks</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{totalStats.activeURLs}</div>
            <div className="stat-label">Active URLs</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{totalStats.expiredURLs}</div>
            <div className="stat-label">Expired URLs</div>
          </div>
        </div>

        {/* Search */}
        <div className="search-container">
          <input
            type="text"
            className="form-input"
            placeholder="Search by URL or shortcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* URL List */}
        <div className="urls-container">
          {filteredURLs.length === 0 ? (
            <div className="no-urls">
              {searchTerm ? 'No URLs found matching your search.' : 'No shortened URLs yet.'}
            </div>
          ) : (
            <div className="urls-list">
              {filteredURLs.map((url) => (
                <div 
                  key={url.id} 
                  className={`url-stat-item ${isExpired(url) ? 'expired' : ''} ${selectedURL?.id === url.id ? 'selected' : ''}`}
                  onClick={() => setSelectedURL(selectedURL?.id === url.id ? null : url)}
                >
                  <div className="url-stat-header">
                    <div className="url-info">
                      <div className="url-original">{url.originalURL}</div>
                      <div className="url-shortened">{url.shortenedURL}</div>
                    </div>
                    <div className="url-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(url.shortenedURL);
                        }}
                      >
                        Copy
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteURL(url.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="url-stat-details">
                    <div className="stat-detail">
                      <span className="detail-label">Clicks:</span>
                      <span className="detail-value">{url.clickCount}</span>
                    </div>
                    <div className="stat-detail">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">{formatDate(url.createdAt)}</span>
                    </div>
                    {url.expiryDate && (
                      <div className="stat-detail">
                        <span className="detail-label">Expires:</span>
                        <span className={`detail-value ${isExpired(url) ? 'expired' : ''}`}>
                          {formatDate(url.expiryDate)}
                        </span>
                      </div>
                    )}
                    {isExpired(url) && (
                      <div className="expired-badge">EXPIRED</div>
                    )}
                  </div>

                  {/* Click Details */}
                  {selectedURL?.id === url.id && url.clicks.length > 0 && (
                    <div className="click-details">
                      <h4>Click History</h4>
                      <div className="clicks-list">
                        {url.clicks.map((click, index) => (
                          <div key={index} className="click-item">
                            <div className="click-timestamp">{formatDate(click.timestamp)}</div>
                            <div className="click-source">Source: {click.source}</div>
                            <div className="click-location">Location: {click.location}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default URLStatistics;
