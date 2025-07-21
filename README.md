# Lokatani API Tester

A comprehensive frontend testing tool for the Lokatani IoT Weight and Image Management Backend API. This tool provides an intuitive interface to test all backend endpoints with proper authentication, debugging capabilities, and enhanced developer experience.

## 🚀 Features

- **Complete API Coverage**: Test all backend endpoints including authentication, weighing sessions, IoT communication, and ML services
- **Dual Authentication Support**: Both Firebase Authentication and API Key authentication
- **Real-time Debugging**: Comprehensive debug console with detailed request/response logging
- **Form Validation**: Real-time validation for JSON data and configuration
- **Developer Tools**: Quick sample data generation, configuration validation, and keyboard shortcuts
- **Enhanced UX**: Loading states, notifications, collapsible sections, and responsive design
- **Mock Authentication**: Built-in mock Firebase authentication for testing without actual Firebase setup

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Running Lokatani backend server
- Valid API keys/tokens for testing protected endpoints

## 🎯 Quick Start

1. **Open the Tester**: Open `index.html` in your web browser
2. **Configure Base URL**: Enter your backend URL in the configuration panel
3. **Set Authentication**: Configure either Firebase token or API key as needed
4. **Start Testing**: Use the endpoint cards to test individual API calls

## 🔧 Configuration

### Base URL
Set the backend server URL (e.g., `http://localhost:5000` or `https://your-backend.com`)

### Authentication
- **Firebase Token**: Required for user-facing endpoints (`/api/auth/`, `/api/weighing/`, `/api/ml/`)
- **API Key**: Required for IoT endpoints (`/api/iot/`)

## 🎮 Development Tools

### Quick Actions
- **Fill Sample Data**: Automatically populate all forms with realistic test data
- **Clear All Data**: Reset all form fields
- **Validate Config**: Check configuration validity
- **Quick Auth Test**: Run authentication endpoint tests
- **Mock Login**: Simulate Firebase authentication

### Keyboard Shortcuts
- `Ctrl+Shift+F`: Fill sample data
- `Ctrl+Shift+X`: Clear all data
- `Ctrl+Shift+V`: Validate configuration
- `Ctrl+Enter`: Quick health check
- `Ctrl+Shift+C`: Clear debug console
- `Ctrl+Shift+R`: Clear response panel

## 📚 API Endpoints Covered

### General
- `GET /` - Health check

### Authentication & User Profile
- `GET /api/auth/profile/{user_id}` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Weighing Sessions
- `GET /api/weighing/history` - Get weighing session history
- `GET /api/weighing/{session_id}` - Get specific weighing session

### IoT Device Communication
- `POST /api/iot/weight` - Send weight data
- `GET /api/iot/active-session` - Get active weighing session
- `POST /api/iot/status` - Send device status

### Machine Learning
- `POST /api/ml/identify-vegetable` - Upload image for vegetable identification

## 🔍 Debugging Features

### Debug Console
- Real-time request/response logging
- Performance monitoring
- Configuration validation
- Network request tracking
- Error details and stack traces

### Visual Indicators
- Authentication status indicators
- Form validation states
- Loading states for active requests
- Color-coded HTTP status responses

## 📊 Sample Data

The tester can generate realistic sample data for all endpoints:

### Profile Data
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+62812345678",
  "location": "Jakarta, Indonesia",
  "preferences": {
    "notifications": true,
    "language": "id"
  }
}
```

### Weight Data
```json
{
  "device_id": "scale_001",
  "weight": 2.35,
  "unit": "kg",
  "timestamp": "2025-07-21T10:30:00.000Z",
  "session_id": "session_1721558400000",
  "temperature": 25.3,
  "humidity": 68.7
}
```

### Device Status
```json
{
  "device_id": "scale_001",
  "status": "online",
  "battery_level": 87,
  "signal_strength": -65,
  "firmware_version": "1.2.3",
  "last_calibration": "2025-07-14T15:20:00.000Z",
  "timestamp": "2025-07-21T10:30:00.000Z"
}
```

## 🎨 UI Features

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Collapsible endpoint categories
- Optimized for different screen sizes

### Dark Mode Support
- Automatic dark mode detection
- Improved visibility in low-light environments

### Enhanced Notifications
- Success, error, warning, and info notifications
- Auto-dismiss with manual close option
- Queue management for multiple notifications

## 🔧 Technical Details

### File Structure
```
lokascale-tester/
├── index.html          # Main HTML interface
├── css/
│   ├── style.css       # Main styles and responsive design
│   └── components.css  # Component-specific styles
└── js/
    ├── app.js          # Main application logic and initialization
    ├── api.js          # API endpoint functions
    ├── auth.js         # Authentication helpers and mock Firebase
    └── utils.js        # Utility functions and debugging tools
```

### Key Functions

#### API Functions (`api.js`)
- `makeApiRequest()`: Base API request handler with error handling
- Individual endpoint functions for each API route
- Comprehensive logging and response display

#### Application Logic (`app.js`)
- Application initialization and state management
- Event listeners and keyboard shortcuts
- Form validation and UI interactions

#### Authentication (`auth.js`)
- Mock Firebase authentication system
- Token management and validation
- UI state updates based on auth status

#### Utilities (`utils.js`)
- Debug logging system
- Configuration management
- Response display utilities
- Performance monitoring

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend has CORS enabled for your domain
2. **Authentication Failures**: Check token format and expiry
3. **Network Errors**: Verify backend URL and server status
4. **File Upload Issues**: Ensure file size limits and format support

### Debug Information

The debug console provides detailed information about:
- Request headers and payloads
- Response status and data
- Authentication state
- Configuration validation
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the backend repository for details.

## 🔗 Related

- [Lokatani Backend Repository](../flask-backend/)
- [API Documentation](../flask-backend/README.md)

---

**Happy Testing!** 🧪✨
