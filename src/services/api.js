import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = this.getStoredToken();
  }

  // Get token from localStorage
  getStoredToken() {
    return localStorage.getItem('access_token');
  }

  // Store token in localStorage
  storeToken(token) {
    localStorage.setItem('access_token', token);
    this.token = token;
  }

  // Clear token from localStorage
  clearToken() {
    localStorage.removeItem('access_token');
    this.token = null;
  }

  // Check if token is expired
  isTokenExpired() {
    const token = this.getStoredToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Add Authorization header if token exists
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token && !this.isTokenExpired()) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token expired or invalid
        this.clearToken();
        throw new Error('Authentication failed. Please login again.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Create shortened URL
  async createShortenedURL(urlData) {
    return this.request('/shorturls', {
      method: 'POST',
      body: JSON.stringify({
        url: urlData.originalURL,
        validity: urlData.validityPeriod,
        shortcode: urlData.preferredShortcode
      })
    });
  }

  // Get all shortened URLs
  async getAllShortenedURLs() {
    return this.request('/shorturls');
  }

  // Get statistics for a specific shortcode
  async getURLStatistics(shortcode) {
    return this.request(`/shorturls/${shortcode}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

const apiService = new ApiService();
export default apiService;
