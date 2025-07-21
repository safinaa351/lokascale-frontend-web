// API Functions for Lokatani Backend Testing

// Base API request function with comprehensive error handling
async function makeApiRequest(endpoint, options = {}) {
    const startTime = Date.now();
    const baseUrl = Config.get('baseUrl');

    if (!Config.validate()) {
        throw new Error('Invalid configuration');
    }

    const url = `${baseUrl.replace(/\/$/, '')}${endpoint}`;
    Debug.info(`Making ${options.method || 'GET'} request to: ${url}`);

    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
        Debug.info(`Request headers: ${JSON.stringify(finalOptions.headers, null, 2)}`);
        if (finalOptions.body) {
            Debug.info(`Request body: ${finalOptions.body}`);
        }

        const response = await fetch(url, finalOptions);
        const responseTime = Date.now() - startTime;

        Debug.info(`Response status: ${response.status} ${response.statusText}`);
        Debug.info(`Response time: ${responseTime}ms`);

        let responseData;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        Debug.info(`Response data: ${JSON.stringify(responseData, null, 2)}`);

        ResponseDisplay.show(responseData, response.status, responseTime);

        if (!response.ok) {
            const errorMessage = typeof responseData === 'object' && responseData.error
                ? responseData.error
                : `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        return { data: responseData, status: response.status, responseTime };

    } catch (error) {
        const responseTime = Date.now() - startTime;
        Debug.error(`Request failed: ${error.message}`);

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showNotification('Network error. Check if the server is running and the URL is correct.', 'error');
        } else {
            showNotification(error.message, 'error');
        }

        throw error;
    }
}

// Health Check - GET /
async function testHealthCheck() {
    const button = event.target;
    setLoadingState(button, true);

    try {
        Debug.info('Testing health check endpoint');
        const result = await makeApiRequest('/');
        showNotification('Health check successful!', 'success');
        Debug.success('Health check completed successfully');
        return result;
    } catch (error) {
        Debug.error(`Health check failed: ${error.message}`);
    } finally {
        setLoadingState(button, false);
    }
}

// Weighing Session Functions

// Initiate Weighing Session - POST /api/weighing/initiate
async function initiateWeighingSession() {
    const button = event.target;
    setLoadingState(button, true);

    try {
        const sessionType = document.getElementById('initSessionType').value || 'rompes';
        Debug.info(`Initiating new weighing session with type: ${sessionType}`);

        const body = JSON.stringify({ session_type: sessionType });
        const headers = Config.getHeaders('firebase');
        const result = await makeApiRequest('/api/weighing/initiate', {
            method: 'POST',
            headers,
            body
        });

        showNotification('Weighing session initiated!', 'success');
        Debug.success(`Session initiated: ${JSON.stringify(result.data)}`);

        // Optionally, display or copy the session_id for user convenience
        if (result.data && result.data.session_id) {
            showNotification(`Session ID: ${result.data.session_id}`, 'info');
        }
        return result;
    } catch (error) {
        Debug.error(`Initiate weighing session failed: ${error.message}`);
    } finally {
        setLoadingState(button, false);
    }
}

// Get Weighing History - GET /api/weighing/history
async function getWeighingHistory() {
    const button = event.target;
    setLoadingState(button, true);

    try {
        Debug.info('Getting weighing session history');

        const headers = Config.getHeaders('firebase');
        const result = await makeApiRequest('/api/weighing/history', {
            headers
        });

        showNotification('Weighing history retrieved successfully!', 'success');
        Debug.success('Weighing history retrieved');
        return result;
    } catch (error) {
        Debug.error(`Get weighing history failed: ${error.message}`);
    } finally {
        setLoadingState(button, false);
    }
}

// Get Weighing Session - GET /api/weighing/{session_id}
async function getWeighingSession() {
    const button = event.target;
    setLoadingState(button, true);

    try {
        const sessionId = Config.get('sessionId');
        Validator.required(sessionId, 'Session ID');

        Debug.info(`Getting weighing session: ${sessionId}`);

        const headers = Config.getHeaders('firebase');
        const result = await makeApiRequest(`/api/weighing/${sessionId}`, {
            headers
        });

        showNotification('Weighing session retrieved successfully!', 'success');
        Debug.success(`Weighing session retrieved: ${sessionId}`);
        return result;
    } catch (error) {
        Debug.error(`Get weighing session failed: ${error.message}`);
    } finally {
        setLoadingState(button, false);
    }
}

// IoT Device Functions

// Send Weight Data - POST /api/iot/weight
async function sendWeightData() {
    const button = event.target;
    setLoadingState(button, true);

    try {
        const weightData = Config.get('weightData');
        Validator.required(weightData, 'Weight Data');
        Validator.json(weightData, 'Weight Data');

        Debug.info('Sending weight data to IoT endpoint');

        // No API key needed in headers for frontend, backend handles it
        const headers = { 'Content-Type': 'application/json' };
        const result = await makeApiRequest('/api/iot/weight', {
            method: 'POST',
            headers,
            body: weightData
        });

        showNotification('Weight data sent successfully!', 'success');
        Debug.success('Weight data sent to IoT endpoint');
        return result;
    } catch (error) {
        Debug.error(`Send weight data failed: ${error.message}`);
    } finally {
        setLoadingState(button, false);
    }
}

// Get Active Session - GET /api/iot/active-session
async function getActiveSession() {
    const button = event.target;
    setLoadingState(button, true);

    try {
        Debug.info('Getting active weighing session from IoT endpoint');

        // No API key needed in headers for frontend, backend handles it
        const headers = {};
        const result = await makeApiRequest('/api/iot/active-session', {
            headers
        });

        showNotification('Active session retrieved successfully!', 'success');
        Debug.success('Active session retrieved from IoT endpoint');
        return result;
    } catch (error) {
        Debug.error(`Get active session failed: ${error.message}`);
    } finally {
        setLoadingState(button, false);
    }
}

// Send Device Status - POST /api/iot/status
async function sendDeviceStatus() {
    const button = event.target;
    setLoadingState(button, true);

    try {
        const statusData = Config.get('statusData');
        Validator.required(statusData, 'Status Data');
        Validator.json(statusData, 'Status Data');

        Debug.info('Sending device status to IoT endpoint');

        // No API key needed in headers for frontend, backend handles it
        const headers = { 'Content-Type': 'application/json' };
        const result = await makeApiRequest('/api/iot/status', {
            method: 'POST',
            headers,
            body: statusData
        });

        showNotification('Device status sent successfully!', 'success');
        Debug.success('Device status sent to IoT endpoint');
        return result;
    } catch (error) {
        Debug.error(`Send device status failed: ${error.message}`);
    } finally {
        setLoadingState(button, false);
    }
}

// Machine Learning Functions

// Identify Vegetable - POST /api/ml/identify-vegetable
async function identifyVegetable() {
    const button = event.target;
    setLoadingState(button, true);

    try {
        const imageFile = document.getElementById('imageFile');
        const sessionId = Config.get('mlSessionId');

        Validator.file(imageFile, 'Image File');

        Debug.info('Uploading image for vegetable identification');

        const formData = new FormData();
        formData.append('image', imageFile.files[0]);

        if (sessionId && sessionId.trim() !== '') {
            formData.append('session_id', sessionId.trim());
            Debug.info(`Linking to session ID: ${sessionId}`);
        }

        const headers = Config.getHeaders('firebase');
        // Remove Content-Type header for FormData (browser will set it with boundary)
        delete headers['Content-Type'];

        Debug.info(`Uploading file: ${imageFile.files[0].name} (${formatFileSize(imageFile.files[0].size)})`);

        const result = await makeApiRequest('/api/ml/identify-vegetable', {
            method: 'POST',
            headers,
            body: formData
        });

        showNotification('Vegetable identification completed successfully!', 'success');
        Debug.success('Vegetable identification completed');
        return result;
    } catch (error) {
        Debug.error(`Vegetable identification failed: ${error.message}`);
    } finally {
        setLoadingState(button, false);
    }
}

// Utility function to test all endpoints sequentially
async function testAllEndpoints() {
    Debug.info('Starting comprehensive API test...');

    const tests = [
        { name: 'Health Check', func: testHealthCheck },
        { name: 'Get Weighing History', func: getWeighingHistory },
        { name: 'Get Active Session', func: getActiveSession }
    ];

    for (const test of tests) {
        try {
            Debug.info(`Running test: ${test.name}`);
            await test.func();
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
        } catch (error) {
            Debug.error(`Test failed - ${test.name}: ${error.message}`);
        }
    }

    Debug.info('Comprehensive API test completed');
}