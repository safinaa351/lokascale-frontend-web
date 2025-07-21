// Authentication Helper Functions for Firebase Integration

// Simple Firebase email/password login using REST API
const FirebaseAuth = {
    currentUser: null,
    firebaseToken: null,
    initialized: false,
    apiKey: "AIzaSyDuP-BxP2ukfVd_MHmx6t7C73hbEuED6fY", 

    init: async () => {
        Debug.info('Firebase Auth bootstrapped');
        FirebaseAuth.initialized = true;
        AuthUI.updateAuthUI();
    },

    // Real login using email/password and Firebase REST API
    login: async (email, password) => {
        Debug.info(`Attempting real Firebase login for: ${email}`);

        try {
            const response = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FirebaseAuth.apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, returnSecureToken: true }),
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || "Login failed");
            }

            FirebaseAuth.currentUser = {
                email: data.email,
                uid: data.localId,
                displayName: data.displayName || data.email.split("@")[0],
                idToken: data.idToken,
                refreshToken: data.refreshToken,
                expiresIn: parseInt(data.expiresIn, 10) || 3600,
                loginTime: Date.now(),
            };
            FirebaseAuth.firebaseToken = data.idToken;
            Config.set('firebaseToken', data.idToken); // For backwards compatibility with other modules
            showNotification(`Logged in as ${data.email}`, 'success');
            AuthUI.updateAuthUI();
            Debug.success('Firebase login successful');
            return data;
        } catch (err) {
            showNotification(`Login failed: ${err.message}`, 'error');
            Debug.error(`Firebase login failed: ${err.message}`);
            throw err;
        }
    },

    logout: async () => {
        Debug.info('Logging out...');
        FirebaseAuth.currentUser = null;
        FirebaseAuth.firebaseToken = null;
        Config.set('firebaseToken', '');
        AuthUI.updateAuthUI();
        Debug.success('Logged out');
        showNotification('Logged out successfully', 'info');
    },

    isAuthenticated: () => {
        return !!FirebaseAuth.currentUser && !!FirebaseAuth.firebaseToken;
    },

    getCurrentUser: () => {
        return FirebaseAuth.currentUser;
    },

    isTokenValid: () => {
        // Token expiry validation (approximate)
        if (!FirebaseAuth.currentUser) return false;
        const { expiresIn, loginTime } = FirebaseAuth.currentUser;
        if (!expiresIn || !loginTime) return true;
        const now = Date.now();
        return now < (loginTime + expiresIn * 1000);
    }
};

// Authentication UI helpers
const AuthUI = {
    updateAuthUI: () => {
        const authIndicator = document.getElementById('authIndicator');
        if (!authIndicator) return;
        if (FirebaseAuth.isAuthenticated()) {
            authIndicator.innerHTML = `
                <i class="fas fa-user-check" style="color: green;"></i>
                Logged in as: ${FirebaseAuth.currentUser.email}
                <button onclick="FirebaseAuth.logout()" style="margin-left: 10px;">Logout</button>
            `;
        } else {
            authIndicator.innerHTML = `
                <i class="fas fa-user-times" style="color: red;"></i>
                Not logged in
            `;
        }
        updateFirebaseEndpointStatus();
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
            indicator.title = 'Firebase token may have expired';
            if (button) button.disabled = true;
        } else {
            indicator.style.background = '#f8d7da';
            indicator.style.color = '#721c24';
            indicator.title = 'Firebase login required';
            if (button) button.disabled = true;
        }
    });
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!email || !password) {
        showNotification('Email and password required', 'warning');
        return;
    }
    try {
        await FirebaseAuth.login(email, password);
    } catch (err) {
        // Error handled by FirebaseAuth.login
    }
}

// Initialize Firebase Auth on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    FirebaseAuth.init();
    AuthUI.updateAuthUI();
    updateFirebaseEndpointStatus();
});

// Export for global access
window.FirebaseAuth = FirebaseAuth;
window.AuthUI = AuthUI;
window.handleLogin = handleLogin;