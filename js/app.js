// Main Application Logic for Lokatani API Tester

// Application state management
const AppState = {
    initialized: false,
    testResults: {},
    activeRequests: new Set(),

    addActiveRequest: (requestId) => {
        AppState.activeRequests.add(requestId);
        Debug.info(`Active requests: ${AppState.activeRequests.size}`);
    },

    removeActiveRequest: (requestId) => {
        AppState.activeRequests.delete(requestId);
        Debug.info(`Active requests: ${AppState.activeRequests.size}`);
    },

    setTestResult: (endpoint, result) => {
        AppState.testResults[endpoint] = {
            ...result,
            timestamp: new Date().toISOString()
        };
        Debug.info(`Test result stored for: ${endpoint}`);
    }
};

// Application initialization
function initializeApp() {
    Debug.info('Initializing Lokatani API Tester application...');

    try {
        // Initialize UI components
        initializeUI();

        // Load saved configuration
        loadSavedConfig();

        // Setup event listeners
        setupEventListeners();

        // Setup keyboard shortcuts
        setupKeyboardShortcuts();

        // Validate initial configuration
        validateInitialConfig();

        AppState.initialized = true;
        Debug.success('Application initialized successfully');
        showNotification('Lokatani API Tester ready!', 'success', 'Welcome');

    } catch (error) {
        Debug.error(`Failed to initialize application: ${error.message}`);
        showNotification('Failed to initialize application', 'error');
    }
}

// Initialize UI components
function initializeUI() {
    Debug.info('Setting up UI components...');

    // Setup form placeholders with example data
    setupFormPlaceholders();

    // Initialize collapsible panels
    initializeCollapsiblePanels();

    // Setup file input handlers
    setupFileInputs();

    // Initialize tooltips
    initializeTooltips();

    Debug.info('UI components initialized');
}

// Setup form placeholders with realistic example data
function setupFormPlaceholders() {
    const placeholders = {
        'sessionId': 'session_id_here',
        'weightData': JSON.stringify({
            "weight (gram)": 250,
            "session_id": "session_id_here"
        }, null, 2),
        'statusData': JSON.stringify({
            "device_id": "scale_001",
            "status": "online",
            "battery_level": 85,
            "signal_strength": -65,
            "timestamp": new Date().toISOString()
        }, null, 2),
        'mlSessionId': 'session_id_here',
    };

    Object.entries(placeholders).forEach(([id, placeholder]) => {
        const element = document.getElementById(id);
        if (element) {
            element.placeholder = placeholder;
            Debug.info(`Set placeholder for ${id}`);
        }
    });
}

// Initialize collapsible panels for better UX
function initializeCollapsiblePanels() {
    const categories = document.querySelectorAll('.endpoint-category h2');

    categories.forEach(header => {
        header.style.cursor = 'pointer';
        header.innerHTML = `<i class="fas fa-chevron-down"></i> ${header.innerHTML}`;

        header.addEventListener('click', () => {
            const category = header.parentElement;
            const cards = category.querySelectorAll('.endpoint-card');
            const icon = header.querySelector('i');

            cards.forEach(card => {
                card.style.display = card.style.display === 'none' ? 'block' : 'none';
            });

            icon.className = icon.className.includes('fa-chevron-down')
                ? 'fas fa-chevron-right'
                : 'fas fa-chevron-down';

            Debug.info(`Toggled category: ${header.textContent.trim()}`);
        });
    });
}

// Setup file input handlers
function setupFileInputs() {
    const fileInputs = document.querySelectorAll('input[type="file"]');

    fileInputs.forEach(input => {
        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                Debug.info(`File selected: ${file.name} (${formatFileSize(file.size)})`);
                showNotification(`File selected: ${file.name}`, 'info');
            }
        });
    });
}

// Initialize tooltips for better user guidance
function initializeTooltips() {
    const authElements = document.querySelectorAll('.auth-required');
    authElements.forEach(element => {
        const authType = element.classList.contains('firebase') ? 'Firebase Token' : 'API Key';
        element.title = `This endpoint requires ${authType} authentication`;
    });
    Debug.info('Tooltips initialized');
}

// Setup comprehensive event listeners
function setupEventListeners() {
    Debug.info('Setting up event listeners...');

    // Configuration auto-save
    const configInputs = ['baseUrl'];
    configInputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', debounce(autoSaveConfig, 500));
            element.addEventListener('blur', validateConfigField);
        }
    });

    // Real-time validation
    setupRealTimeValidation();

    // Window events
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    Debug.info('Event listeners setup complete');
}

// Setup real-time validation for form fields
function setupRealTimeValidation() {
    const validationFields = [
        { id: 'weightData', validator: 'json' },
        { id: 'statusData', validator: 'json' },
        { id: 'baseUrl', validator: 'url' }
    ];

    validationFields.forEach(({ id, validator }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', debounce(() => {
                validateField(element, validator);
            }, 300));
        }
    });
}

// Validate individual field
function validateField(element, validatorType) {
    const value = element.value.trim();

    try {
        if (value === '') {
            clearFieldError(element);
            return;
        }

        switch (validatorType) {
            case 'json':
                Validator.json(value);
                break;
            case 'url':
                Validator.url(value);
                break;
        }

        showFieldSuccess(element);
    } catch (error) {
        showFieldError(element, error.message);
    }
}

// Visual feedback for field validation
function showFieldError(element, message) {
    element.classList.add('error');
    element.classList.remove('success');

    let errorDiv = element.parentElement.querySelector('.field-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        element.parentElement.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

function showFieldSuccess(element) {
    element.classList.add('success');
    element.classList.remove('error');

    const errorDiv = element.parentElement.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function clearFieldError(element) {
    element.classList.remove('error', 'success');

    const errorDiv = element.parentElement.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Validate configuration field on blur
function validateConfigField(event) {
    const field = event.target;
    const value = field.value.trim();

    if (field.id === 'baseUrl' && value) {
        try {
            Validator.url(value);
            Debug.success(`Valid URL configured: ${value}`);
        } catch (error) {
            Debug.warning(`Invalid URL: ${error.message}`);
        }
    }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Ctrl+Enter to test health check
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            testHealthCheck();
            Debug.info('Health check triggered via keyboard shortcut');
        }

        // Ctrl+Shift+C to clear debug console
        if (event.ctrlKey && event.shiftKey && event.key === 'C') {
            event.preventDefault();
            clearDebug();
        }

        // Ctrl+Shift+R to clear response panel
        if (event.ctrlKey && event.shiftKey && event.key === 'R') {
            event.preventDefault();
            clearResponse();
        }
    });

    Debug.info('Keyboard shortcuts registered');
}

// Validate initial configuration
function validateInitialConfig() {
    const baseUrl = Config.get('baseUrl');

    if (!baseUrl) {
        Debug.warning('No base URL configured');
        showNotification('Please configure the base URL to start testing', 'warning');
    } else {
        try {
            Validator.url(baseUrl);
            Debug.success('Base URL is valid');
        } catch (error) {
            Debug.error(`Invalid base URL: ${error.message}`);
            showNotification('Please enter a valid base URL', 'error');
        }
    }
}

// Handle browser events
function handleBeforeUnload(event) {
    if (AppState.activeRequests.size > 0) {
        event.preventDefault();
        event.returnValue = 'You have active API requests. Are you sure you want to leave?';
    }
}

function handleOnline() {
    Debug.success('Connection restored');
    showNotification('Connection restored', 'success');
}

function handleOffline() {
    Debug.warning('Connection lost');
    showNotification('Connection lost - API requests may fail', 'warning');
}

// Utility function for debouncing rapid events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enhanced configuration save with validation
function autoSaveConfig() {
    try {
        const config = {
            baseUrl: Config.get('baseUrl'),
            timestamp: new Date().toISOString()
        };

        Storage.save('config', config);
        Debug.info('Configuration auto-saved');
    } catch (error) {
        Debug.error(`Failed to auto-save configuration: ${error.message}`);
    }
}

// Application health monitoring
function checkAppHealth() {
    const issues = [];

    if (!Config.get('baseUrl')) {
        issues.push('Base URL not configured');
    }

    if (!navigator.onLine) {
        issues.push('No internet connection');
    }

    if (AppState.activeRequests.size > 5) {
        issues.push('Too many concurrent requests');
    }

    if (issues.length > 0) {
        Debug.warning(`App health issues: ${issues.join(', ')}`);
    } else {
        Debug.info('Application health check passed');
    }

    return issues.length === 0;
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Debug.info('DOM loaded, starting application initialization...');
    initializeApp();

    // Run health check every 30 seconds
    setInterval(checkAppHealth, 30000);
});

// Export functions for global access (if needed)
window.AppState = AppState;