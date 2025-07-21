// Utility Functions for Lokatani API Tester

// Debug logging system
const Debug = {
    log: (message, type = 'info') => {
        const debugContent = document.getElementById('debugContent');
        const timestamp = new Date().toLocaleTimeString();
        
        const debugItem = document.createElement('div');
        debugItem.className = `debug-item ${type}`;
        debugItem.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="message">${message}</span>
        `;
        
        debugContent.appendChild(debugItem);
        debugContent.scrollTop = debugContent.scrollHeight;
        
        // Also log to console for debugging
        console.log(`[${type.toUpperCase()}] ${message}`);
    },
    
    info: (message) => Debug.log(message, 'info'),
    success: (message) => Debug.log(message, 'success'),
    warning: (message) => Debug.log(message, 'warning'),
    error: (message) => Debug.log(message, 'error')
};

// Configuration management
const Config = {
    get: (key) => {
        const element = document.getElementById(key);
        return element ? element.value.trim() : '';
    },
    
    set: (key, value) => {
        const element = document.getElementById(key);
        if (element) {
            element.value = value;
        }
    },
    
    validate: () => {
        const baseUrl = Config.get('baseUrl');
        if (!baseUrl) {
            showNotification('Please enter a base URL', 'error');
            return false;
        }
        
        try {
            new URL(baseUrl);
        } catch (e) {
            showNotification('Please enter a valid URL', 'error');
            return false;
        }
        
        return true;
    },
    
    getHeaders: (authType = 'none') => {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (authType === 'firebase') {
            const token = Config.get('firebaseToken');
            if (!token) {
                throw new Error('Firebase token is required for this endpoint');
            }
            headers['Authorization'] = `Bearer ${token}`;
        } else if (authType === 'api') {
            const apiKey = Config.get('apiKey');
            if (!apiKey) {
                throw new Error('API key is required for this endpoint');
            }
            headers['X-API-Key'] = apiKey;
        }
        
        return headers;
    }
};

// Response display utilities
const ResponseDisplay = {
    show: (data, status = null, responseTime = null) => {
        const responsePanel = document.getElementById('responsePanel');
        const responseContent = document.getElementById('responseContent');
        
        let statusHtml = '';
        if (status !== null) {
            const statusClass = status >= 200 && status < 300 ? 'success' : 
                              status >= 400 && status < 500 ? 'warning' : 'error';
            const statusText = getStatusText(status);
            
            statusHtml = `
                <div class="response-status ${statusClass}">
                    <span class="status-code ${statusClass}">${status}</span>
                    <span class="status-text">${statusText}</span>
                    ${responseTime ? `<span class="response-time">${responseTime}ms</span>` : ''}
                </div>
            `;
        }
        
        const jsonData = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        const highlightedJson = syntaxHighlight(jsonData);
        
        responseContent.innerHTML = `
            ${statusHtml}
            <div class="response-json">${highlightedJson}</div>
        `;
        
        // Scroll to response panel
        responsePanel.scrollIntoView({ behavior: 'smooth' });
    },
    
    clear: () => {
        const responseContent = document.getElementById('responseContent');
        responseContent.innerHTML = `
            <div class="no-response">
                <i class="fas fa-info-circle"></i>
                No response yet. Test an endpoint to see results here.
            </div>
        `;
    }
};

// JSON syntax highlighting
function syntaxHighlight(json) {
    if (typeof json !== 'string') {
        json = JSON.stringify(json, null, 2);
    }
    
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'json-number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'json-key';
            } else {
                cls = 'json-string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
        } else if (/null/.test(match)) {
            cls = 'json-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// HTTP status code to text mapping
function getStatusText(status) {
    const statusTexts = {
        200: 'OK',
        201: 'Created',
        204: 'No Content',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        422: 'Unprocessable Entity',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable'
    };
    
    return statusTexts[status] || 'Unknown Status';
}

// Notification system
function showNotification(message, type = 'info', title = null) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const titles = {
        success: title || 'Success',
        error: title || 'Error',
        warning: title || 'Warning',
        info: title || 'Info'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="notification-icon ${icons[type]}"></i>
            <div class="notification-text">
                <div class="notification-title">${titles[type]}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="closeNotification(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            closeNotification(notification.querySelector('.notification-close'));
        }
    }, 5000);
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Loading state management
function setLoadingState(button, loading = true) {
    const endpointCard = button.closest('.endpoint-card');
    
    if (loading) {
        button.disabled = true;
        endpointCard.classList.add('loading');
        Debug.info('Request started...');
    } else {
        button.disabled = false;
        endpointCard.classList.remove('loading');
    }
}

// Form validation utilities
const Validator = {
    required: (value, fieldName) => {
        if (!value || value.trim() === '') {
            throw new Error(`${fieldName} is required`);
        }
        return true;
    },
    
    json: (value, fieldName = 'JSON') => {
        if (!value || value.trim() === '') return true; // Optional
        
        try {
            JSON.parse(value);
            return true;
        } catch (e) {
            throw new Error(`${fieldName} must be valid JSON: ${e.message}`);
        }
    },
    
    url: (value, fieldName = 'URL') => {
        try {
            new URL(value);
            return true;
        } catch (e) {
            throw new Error(`${fieldName} must be a valid URL`);
        }
    },
    
    file: (fileInput, fieldName = 'File') => {
        if (!fileInput.files || fileInput.files.length === 0) {
            throw new Error(`${fieldName} is required`);
        }
        return true;
    }
};

// Local storage utilities for saving configuration
const Storage = {
    save: (key, value) => {
        try {
            localStorage.setItem(`lokatani_api_tester_${key}`, JSON.stringify(value));
        } catch (e) {
            Debug.warning(`Failed to save ${key} to localStorage: ${e.message}`);
        }
    },
    
    load: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(`lokatani_api_tester_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            Debug.warning(`Failed to load ${key} from localStorage: ${e.message}`);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(`lokatani_api_tester_${key}`);
        } catch (e) {
            Debug.warning(`Failed to remove ${key} from localStorage: ${e.message}`);
        }
    }
};

// Utility functions for UI interactions
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function clearDebug() {
    const debugContent = document.getElementById('debugContent');
    debugContent.innerHTML = `
        <div class="debug-item info">
            <span class="timestamp">[System]</span>
            <span class="message">Debug console cleared</span>
        </div>
    `;
    Debug.info('Debug console cleared');
}

function clearResponse() {
    ResponseDisplay.clear();
    Debug.info('Response panel cleared');
}

function copyResponse() {
    const responseContent = document.getElementById('responseContent');
    const textToCopy = responseContent.innerText || responseContent.textContent;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        showNotification('Response copied to clipboard!', 'success');
        Debug.info('Response copied to clipboard');
    }).catch(err => {
        Debug.error(`Failed to copy response: ${err.message}`);
        showNotification('Failed to copy response', 'error');
    });
}

// Format file size for display
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Auto-save configuration
function autoSaveConfig() {
    const config = {
        baseUrl: Config.get('baseUrl'),
        // Don't save sensitive data like tokens and API keys
    };
    Storage.save('config', config);
}

// Load saved configuration
function loadSavedConfig() {
    const config = Storage.load('config');
    if (config) {
        Config.set('baseUrl', config.baseUrl || '');
        Debug.info('Configuration loaded from localStorage');
    }
}

// Initialize utilities when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadSavedConfig();
    Debug.info('API Tester utilities initialized');
    
    // Auto-save configuration when base URL changes
    const baseUrlInput = document.getElementById('baseUrl');
    if (baseUrlInput) {
        baseUrlInput.addEventListener('input', autoSaveConfig);
    }
});

// Enhanced debugging capabilities for development
const AdvancedDebug = {
    // Network request tracking
    logNetworkRequest: (url, method, headers, body) => {
        const timestamp = new Date().toLocaleTimeString();
        Debug.log(`🌐 [${timestamp}] ${method} ${url}`, 'info');
        Debug.log(`📤 Headers: ${JSON.stringify(headers, null, 2)}`, 'info');
        if (body) {
            Debug.log(`📤 Body: ${typeof body === 'string' ? body : JSON.stringify(body, null, 2)}`, 'info');
        }
    },
    
    // Network response tracking
    logNetworkResponse: (url, status, responseTime, data) => {
        const timestamp = new Date().toLocaleTimeString();
        const statusIcon = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : '⚠️';
        Debug.log(`${statusIcon} [${timestamp}] Response ${status} (${responseTime}ms)`, 
                 status >= 200 && status < 300 ? 'success' : 'error');
        Debug.log(`📥 Response: ${JSON.stringify(data, null, 2)}`, 'info');
    },
    
    // Performance monitoring
    performanceLog: (operation, duration) => {
        const level = duration > 5000 ? 'warning' : duration > 10000 ? 'error' : 'info';
        Debug.log(`⏱️ ${operation} completed in ${duration}ms`, level);
    },
    
    // Configuration validation logging
    logConfigValidation: () => {
        const config = {
            baseUrl: Config.get('baseUrl'),
            hasApiKey: !!Config.get('apiKey'),
            hasFirebaseToken: !!Config.get('firebaseToken')
        };
        Debug.log(`🔧 Config Status: ${JSON.stringify(config, null, 2)}`, 'info');
    },
    
    // Endpoint test summary
    logTestSummary: (endpoint, success, duration, error = null) => {
        const icon = success ? '✅' : '❌';
        const message = success 
            ? `${icon} ${endpoint} - SUCCESS (${duration}ms)`
            : `${icon} ${endpoint} - FAILED: ${error}`;
        Debug.log(message, success ? 'success' : 'error');
    }
};

// Enhanced configuration management
const EnhancedConfig = {
    // Validate all configuration at once
    validateAll: () => {
        const validations = [];
        
        // Base URL validation
        const baseUrl = Config.get('baseUrl');
        if (!baseUrl) {
            validations.push({ field: 'baseUrl', status: 'missing', message: 'Base URL is required' });
        } else {
            try {
                new URL(baseUrl);
                validations.push({ field: 'baseUrl', status: 'valid', message: 'Base URL is valid' });
            } catch (e) {
                validations.push({ field: 'baseUrl', status: 'invalid', message: 'Base URL format is invalid' });
            }
        }
        
        // API Key validation
        const apiKey = Config.get('apiKey');
        if (!apiKey) {
            validations.push({ field: 'apiKey', status: 'missing', message: 'API Key not configured' });
        } else {
            validations.push({ field: 'apiKey', status: 'configured', message: 'API Key is configured' });
        }
        
        // Firebase Token validation
        const firebaseToken = Config.get('firebaseToken');
        if (!firebaseToken) {
            validations.push({ field: 'firebaseToken', status: 'missing', message: 'Firebase Token not configured' });
        } else {
            validations.push({ field: 'firebaseToken', status: 'configured', message: 'Firebase Token is configured' });
        }
        
        Debug.log('📋 Configuration Validation:', 'info');
        validations.forEach(v => {
            const level = v.status === 'valid' || v.status === 'configured' ? 'success' : 
                         v.status === 'missing' ? 'warning' : 'error';
            Debug.log(`  ${v.field}: ${v.message}`, level);
        });
        
        return validations;
    },
    
    // Export configuration for backup
    exportConfig: () => {
        const config = {
            baseUrl: Config.get('baseUrl'),
            // Don't export sensitive data in logs
            hasApiKey: !!Config.get('apiKey'),
            hasFirebaseToken: !!Config.get('firebaseToken'),
            exportedAt: new Date().toISOString()
        };
        
        Debug.log(`📤 Configuration Export: ${JSON.stringify(config, null, 2)}`, 'info');
        return config;
    }
};

// Test automation utilities
const TestRunner = {
    // Run a series of tests with delays
    runSequential: async (tests, delay = 2000) => {
        Debug.log(`🚀 Starting sequential test run with ${tests.length} tests`, 'info');
        const results = [];
        
        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            const startTime = Date.now();
            
            try {
                Debug.log(`📝 Running test ${i + 1}/${tests.length}: ${test.name}`, 'info');
                const result = await test.func();
                const duration = Date.now() - startTime;
                
                results.push({
                    name: test.name,
                    success: true,
                    duration,
                    result
                });
                
                AdvancedDebug.logTestSummary(test.name, true, duration);
                
                if (i < tests.length - 1) {
                    Debug.log(`⏳ Waiting ${delay}ms before next test...`, 'info');
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            } catch (error) {
                const duration = Date.now() - startTime;
                results.push({
                    name: test.name,
                    success: false,
                    duration,
                    error: error.message
                });
                
                AdvancedDebug.logTestSummary(test.name, false, duration, error.message);
            }
        }
        
        // Summary
        const successful = results.filter(r => r.success).length;
        const failed = results.length - successful;
        Debug.log(`📊 Test Summary: ${successful} passed, ${failed} failed`, 
                 failed === 0 ? 'success' : 'warning');
        
        return results;
    }
};

// Development helpers
const DevHelpers = {
    // Generate sample data for testing
    generateSampleData: () => {
        const samples = {
            profileData: JSON.stringify({
                name: "John Doe",
                email: "john.doe@example.com",
                phone: "+62812345678",
                location: "Jakarta, Indonesia",
                preferences: {
                    notifications: true,
                    language: "id"
                }
            }, null, 2),
            
            weightData: JSON.stringify({
                device_id: "scale_001",
                weight: Math.round((Math.random() * 5 + 0.5) * 100) / 100, // Random weight 0.5-5.5 kg
                unit: "kg",
                timestamp: new Date().toISOString(),
                session_id: `session_${Date.now()}`,
                temperature: Math.round((Math.random() * 10 + 20) * 10) / 10, // 20-30°C
                humidity: Math.round((Math.random() * 20 + 60) * 10) / 10 // 60-80%
            }, null, 2),
            
            statusData: JSON.stringify({
                device_id: "scale_001",
                status: "online",
                battery_level: Math.floor(Math.random() * 100),
                signal_strength: Math.floor(Math.random() * 40) - 80, // -80 to -40 dBm
                firmware_version: "1.2.3",
                last_calibration: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                timestamp: new Date().toISOString()
            }, null, 2)
        };
        
        Debug.log('🎲 Generated sample data:', 'info');
        Object.entries(samples).forEach(([key, value]) => {
            Debug.log(`  ${key}: ${value}`, 'info');
        });
        
        return samples;
    },
    
    // Fill forms with sample data
    fillSampleData: () => {
        const samples = DevHelpers.generateSampleData();
        
        // Fill forms with generated data
        Object.entries(samples).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                element.value = value;
                Debug.log(`📝 Filled ${key} with sample data`, 'success');
                
                // Trigger input event for validation
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        
        // Fill other fields with reasonable defaults
        Config.set('getUserId', 'sample_user_' + Math.random().toString(36).substr(2, 9));
        Config.set('sessionId', 'session_' + Math.random().toString(36).substr(2, 9));
        Config.set('mlSessionId', 'ml_session_' + Math.random().toString(36).substr(2, 9));
        
        showNotification('Sample data filled in all forms!', 'success');
        Debug.success('All forms filled with sample data');
    },
    
    // Clear all form data
    clearAllData: () => {
        const formFields = [
            'profileData', 'weightData', 'statusData', 'getUserId', 
            'sessionId', 'mlSessionId', 'imageFile'
        ];
        
        formFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = '';
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        
        showNotification('All form data cleared!', 'info');
        Debug.info('All form data cleared');
    }
};

// Add keyboard shortcuts for development
function setupDevelopmentShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Ctrl+Shift+F to fill sample data
        if (event.ctrlKey && event.shiftKey && event.key === 'F') {
            event.preventDefault();
            DevHelpers.fillSampleData();
        }
        
        // Ctrl+Shift+X to clear all data
        if (event.ctrlKey && event.shiftKey && event.key === 'X') {
            event.preventDefault();
            DevHelpers.clearAllData();
        }
        
        // Ctrl+Shift+V to validate all config
        if (event.ctrlKey && event.shiftKey && event.key === 'V') {
            event.preventDefault();
            EnhancedConfig.validateAll();
        }
        
        // Ctrl+Shift+E to export config
        if (event.ctrlKey && event.shiftKey && event.key === 'E') {
            event.preventDefault();
            EnhancedConfig.exportConfig();
        }
    });
    
    Debug.info('🎮 Development shortcuts registered:');
    Debug.info('  Ctrl+Shift+F: Fill sample data');
    Debug.info('  Ctrl+Shift+X: Clear all data');
    Debug.info('  Ctrl+Shift+V: Validate configuration');
    Debug.info('  Ctrl+Shift+E: Export configuration');
}

// Enhanced notification system with better UX
function showEnhancedNotification(message, type = 'info', title = null, duration = 5000) {
    // Use existing notification system but with enhanced features
    showNotification(message, type, title);
    
    // Log to debug console as well
    Debug.log(`💬 Notification: ${title || type.toUpperCase()} - ${message}`, type);
}

// Performance monitoring
const PerformanceMonitor = {
    marks: new Map(),
    
    start: (label) => {
        PerformanceMonitor.marks.set(label, Date.now());
        Debug.log(`⏱️ Started: ${label}`, 'info');
    },
    
    end: (label) => {
        const startTime = PerformanceMonitor.marks.get(label);
        if (startTime) {
            const duration = Date.now() - startTime;
            PerformanceMonitor.marks.delete(label);
            AdvancedDebug.performanceLog(label, duration);
            return duration;
        } else {
            Debug.warning(`⚠️ No start mark found for: ${label}`);
            return null;
        }
    }
};

// Initialize enhanced utilities when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Setup development shortcuts
    setupDevelopmentShortcuts();
    
    // Log initial configuration state
    setTimeout(() => {
        AdvancedDebug.logConfigValidation();
    }, 1000);
    
    Debug.success('🔧 Enhanced utilities initialized');
});