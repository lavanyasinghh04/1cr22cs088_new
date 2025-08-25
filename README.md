# URL Shortener

A React-based URL shortening web application that allows users to create shortened URLs with optional validity periods and preferred shortcodes. The application runs entirely on the client-side with data persistence using localStorage.

## Features

### URL Shortening
- **Concurrent URL Processing**: Shorten up to 5 URLs at once
- **Custom Shortcodes**: Option to specify preferred shortcodes
- **Validity Periods**: Set optional expiration dates for URLs
- **URL Validation**: Client-side validation for proper URL format
- **Unique Shortcodes**: Automatic generation of unique 6-character alphanumeric codes

### Statistics & Management
- **Comprehensive Statistics**: View total URLs, clicks, active/expired URLs
- **Click Tracking**: Detailed click history with timestamps, sources, and locations
- **Search Functionality**: Search URLs by original URL or shortcode
- **URL Management**: Copy shortened URLs to clipboard and delete URLs
- **Expiration Handling**: Visual indicators for expired URLs

### User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with native CSS styling
- **Error Handling**: Clear error messages for invalid inputs
- **Data Persistence**: URLs and statistics saved in browser localStorage

## Technical Stack

- **Frontend**: React 18.2.0
- **Routing**: React Router DOM 6.3.0
- **Styling**: Native CSS (no frameworks)
- **Data Storage**: Browser localStorage
- **Build Tool**: Create React App

## Installation & Setup

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Usage

### Creating Shortened URLs

1. Navigate to the "Shorten URLs" page
2. Enter the original URL (must start with http:// or https://)
3. Optionally set a validity period in minutes (defaults to 30 minutes)
4. Optionally specify a preferred shortcode (alphanumeric only)
5. Click "Shorten URLs" to generate the shortened URL
6. Use "Add Another URL" to process multiple URLs simultaneously (up to 5)

### Viewing Statistics

1. Navigate to the "Statistics" page
2. View summary statistics at the top
3. Search for specific URLs using the search bar
4. Click on any URL to view detailed click history
5. Use the "Copy" button to copy shortened URLs to clipboard
6. Use the "Delete" button to remove URLs

### URL Redirection

- Shortened URLs follow the format: `http://localhost:3000/{shortcode}`
- When accessed, the application automatically redirects to the original URL
- Click data is recorded automatically during redirection
- Expired URLs show an error message instead of redirecting

## Data Structure

Each shortened URL is stored with the following structure:

```javascript
{
  id: "unique_identifier",
  originalURL: "https://example.com",
  shortcode: "abc123",
  shortenedURL: "http://localhost:3000/abc123",
  createdAt: "2024-01-01T00:00:00.000Z",
  expiryDate: "2024-02-01T00:00:00.000Z", // optional
  clickCount: 5,
  clicks: [
    {
      timestamp: "2024-01-01T12:00:00.000Z",
      source: "Direct",
      location: "Unknown"
    }
  ]
}
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Limitations

- Data is stored locally in the browser (localStorage)
- No server-side persistence
- Geolocation data is limited to "Unknown" due to browser restrictions
- Click source detection depends on browser referrer policies

## Future Enhancements

- Server-side data persistence
- User authentication
- Advanced analytics and charts
- Custom domain support
- API endpoints for programmatic access
- QR code generation for shortened URLs

## License

This project is open source and available under the MIT License.
