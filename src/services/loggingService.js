import config from '../config';

const LOGGING_API_URL = 'http://20.244.56.144/evaluation-service/logs';
const AUTH_API_URL = 'http://20.244.56.144/evaluation-service/auth';

class LoggingService {
  constructor() {
    this.accessToken = null;
    this.clientId = config.CLIENT_ID;
    this.clientSecret = config.CLIENT_SECRET;
  }

  // Get access token for logging
  async getAccessToken() {
    try {
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: this.clientId,
          clientSecret: this.clientSecret
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get logging access token:', error);
      return null;
    }
  }

  // Send log to remote service
  async sendLog(stack, level, packageName, message) {
    if (!this.accessToken) {
      this.accessToken = await this.getAccessToken();
      if (!this.accessToken) {
        // Fallback to console logging if remote logging fails
        console.log(`[${stack.toUpperCase()}] [${level.toUpperCase()}] [${packageName}]: ${message}`);
        return false;
      }
    }

    const logEntry = {
      stack: stack.toLowerCase(),
      level: level.toLowerCase(),
      package: packageName.toLowerCase(),
      message: message.toLowerCase(),
    };

    try {
      const response = await fetch(LOGGING_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(logEntry),
      });

      if (response.status === 401) {
        // Token expired, get a new one and retry
        this.accessToken = await this.getAccessToken();
        if (this.accessToken) {
          return await this.sendLog(stack, level, packageName, message);
        }
        return false;
      }

      if (!response.ok) {
        console.error(`Remote logging failed with status: ${response.status}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to send log to remote service:', error);
      // Fallback to console logging
      console.log(`[${stack.toUpperCase()}] [${level.toUpperCase()}] [${packageName}]: ${message}`);
      return false;
    }
  }

  // Public logging method
  async log(stack, level, packageName, message) {
    try {
      return await this.sendLog(stack, level, packageName, message);
    } catch (error) {
      console.error('Logging error:', error);
      // Fallback to console logging
      console.log(`[${stack.toUpperCase()}] [${level.toUpperCase()}] [${packageName}]: ${message}`);
      return false;
    }
  }
}

// Create singleton instance
const loggingService = new LoggingService();
export default loggingService;
