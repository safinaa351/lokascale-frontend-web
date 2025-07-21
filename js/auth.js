// Authentication Helper Functions for Firebase Integration

// Firebase Auth state management
const FirebaseAuth = {
    currentUser: null,
    initialized: false,
    
    // Initialize Firebase (placeholder - would need actual Firebase config)
    init: async () => {
        Debug.info('Initializing Firebase Auth (placeholder)...');
        // In a real implementation, you would initialize Firebase here
        // firebase.initializeApp(firebaseConfig);
        FirebaseAuth.initialized = true;
        Debug.success('Firebase Auth initialized (mock)');
    },
    
    // Mock login function
    mockLogin: async (email, password) => {
        Debug.info(`Mock login attempt for: ${email}`);
        
        // Simulate login process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock user object
        const mockUser = {
            uid: 'mock_user_' + Math.random().toString(36).substr(2, 9),
            email: email,
            displayName: email.split('@')[0],
            emailVerified: true
        };
        
        FirebaseAuth.currentUser = mockUser;
        
        // Mock ID token (in real implementation, this would come from Firebase)
        const mockToken = 'mock_firebase_token_' + btoa(JSON.stringify({
            uid: mockUser.uid,
            email: mockUser.email,
            exp: Date.now() + (3600 * 1000) // 1 hour from now
        }));
        
        // Store token for API requests
        Config.set('firebaseToken', mockToken);
        
        Debug.success(`Mock login successful for: ${email}`);
        showNotification(`Logged in as ${email}`, 'success');
        
        return { user: mockUser, token: mockToken };
    },
    
    // Mock logout function
    logout: async () => {
        Debug.info('Logging out...');
        
        FirebaseAuth.currentUser = null;
        Config.set('firebaseToken', '');
        
        Debug.success('Logged out successfully');
        showNotification('Logged out successfully', 'info');
    },
    
    // Check if user is authenticated
    isAuthenticated: () => {
        const token = Config.get('firebaseToken');
        return FirebaseAuth.currentUser && token && token.trim() !== '';
    },
    
    // Get current user info
    getCurrentUser: () => {
        return FirebaseAuth.currentUser;
    },
    
    // Validate token expiry (mock implementation)
    isTokenValid: () => {
        const token = Config.get('firebaseToken');
        if (!token || !token.startsWith('mock_firebase_token_')) {
            return false;
        }
        
        try {
            const payload = JSON.parse(atob(token.replace('mock_firebase_token_', '')));
            return payload.exp > Date.now();
        } catch (error) {
            Debug.error(`Token validation error: ${error.message}`);
            return false;
        }
    }
};

// Authentication UI helpers
const AuthUI = {
    // Show login modal (if you want to implement a login UI)
    showLoginModal: () => {
        Debug.info('Login modal requested');
        
        // For now, just show a prompt for email/password
        const email = prompt('Enter email for mock login:');
        if (email) {
            const password = prompt('Enter password:') || 'mockpassword';
            FirebaseAuth.mockLogin(email, password);
        }
    },
    
    // Update UI based on auth state
    updateAuthUI: () => {
        const user = FirebaseAuth.getCurrentUser();
        const authIndicator = document.getElementById('authIndicator');
        
        if (authIndicator) {
            if (user) {
                authIndicator.innerHTML = `
                    <i class="fas fa-user-check" style="color: green;"></i>
                    Logged in as: ${user.email}
                    <button onclick="FirebaseAuth.logout()" style="margin-left: 10px;">Logout</button>
                `;
            } else {
                authIndicator.innerHTML = `
                    <i class="fas fa-user-times" style="color: red;"></i>
                    Not logged in
                    <button onclick="AuthUI.showLoginModal()" style="margin-left: 10px;">Login</button>
                `;
            }
        }
        
        // Update Firebase endpoints visual indicators
        updateFirebaseEndpointStatus();
    },
    
    // Add auth status indicator to the page
    addAuthIndicator: () => {
        const header = document.querySelector('.header-content');
        if (header && !document.getElementById('authIndicator')) {
            const authDiv = document.createElement('div');
            authDiv.id = 'authIndicator';
            authDiv.style.cssText = 'margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; font-size: 14px;';
            header.appendChild(authDiv);
            
            AuthUI.updateAuthUI();
        }
    }
};

// Update visual indicators for Firebase-protected endpoints
function updateFirebaseEndpointStatus() {
    const firebaseEndpoints = document.querySelectorAll('.auth-required.firebase');
    const isAuthenticated = FirebaseAuth.isAuthenticated();
    const isTokenValid = FirebaseAuth.isTokenValid();
    
    firebaseEndpoints.forEach(indicator => {
        const card = indicator.closest('.endpoint-card');
        const button = card.querySelector('.test-btn');
        
        if (isAuthenticated && isTokenValid) {
            indicator.style.background = '#d4edda';
            indicator.style.color = '#155724';
            indicator.title = 'Firebase token is configured and valid';
            if (button) button.disabled = false;
        } else if (isAuthenticated && !isTokenValid) {
            indicator.style.background = '#fff3cd';
            indicator.style.color = '#856404';
            indicator.title = 'Firebase token has expired';
            if (button) button.disabled = true;
        } else {
            indicator.style.background = '#f8d7da';
            indicator.style.color = '#721c24';
            indicator.title = 'Firebase token required';
            if (button) button.disabled = true;
        }
    });
}

// Update visual indicators for API key-protected endpoints
function updateApiKeyEndpointStatus() {
    const apiEndpoints = document.querySelectorAll('.auth-required.api');
    const hasApiKey = Config.get('apiKey').trim() !== '';
    
    apiEndpoints.forEach(indicator => {
        const card = indicator.closest('.endpoint-card');
        const button = card.querySelector('.test-btn');
        
        if (hasApiKey) {
            indicator.style.background = '#d4edda';
            indicator.style.color = '#155724';
            indicator.title = 'API key is configured';
            if (button) button.disabled = false;
        } else {
            indicator.style.background = '#f8d7da';
            indicator.style.color = '#721c24';
            indicator.title = 'API key required';
            if (button) button.disabled = true;
        }
    });
}

// Token management utilities
const TokenManager = {
    // Refresh token if needed (mock implementation)
    refreshTokenIfNeeded: async () => {
        if (FirebaseAuth.isAuthenticated() && !FirebaseAuth.isTokenValid()) {
            Debug.warning('Token expired, attempting refresh...');
            
            // In a real implementation, you would call Firebase's token refresh
            // For now, just show a notification
            showNotification('Token expired. Please log in again.', 'warning');
            FirebaseAuth.logout();
        }
    },
    
    // Auto-refresh token periodically
    startAutoRefresh: () => {
        setInterval(() => {
            if (FirebaseAuth.isAuthenticated()) {
                TokenManager.refreshTokenIfNeeded();
            }
        }, 5 * 60 * 1000); // Check every 5 minutes
        
        Debug.info('Auto token refresh started');
    }
};

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Debug.info('Initializing authentication system...');
    
    // Initialize Firebase
    FirebaseAuth.init();
    
    // Add auth indicator to UI
    AuthUI.addAuthIndicator();
    
    // Start token auto-refresh
    TokenManager.startAutoRefresh();
    
    // Monitor config changes for API key
    const apiKeyInput = document.getElementById('apiKey');
    if (apiKeyInput) {
        apiKeyInput.addEventListener('input', () => {
            updateApiKeyEndpointStatus();
        });
    }
    
    // Monitor config changes for Firebase token
    const firebaseTokenInput = document.getElementById('firebaseToken');
    if (firebaseTokenInput) {
        firebaseTokenInput.addEventListener('input', () => {
            updateFirebaseEndpointStatus();
        });
    }
    
    // Initial status update
    setTimeout(() => {
        updateFirebaseEndpointStatus();
        updateApiKeyEndpointStatus();
    }, 100);
    
    Debug.success('Authentication system initialized');
});