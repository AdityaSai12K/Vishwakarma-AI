/**
 * API Module for Floor Plan Processing
 * Handles all communication with the Flask backend
 */

// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000',
    ENDPOINTS: {
        UPLOAD: '/api/upload',
        PROCESS: '/api/process'
    }
};

/**
 * Upload image file to the backend
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} Response with filename and metadata
 * @throws {Error} If upload fails
 */
async function uploadImage(file) {
    // Validate file
    if (!file) {
        throw new Error('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Allowed: PNG, JPG, JPEG, GIF, BMP');
    }

    // Validate file size (16MB max)
    const maxSize = 16 * 1024 * 1024; // 16MB
    if (file.size > maxSize) {
        throw new Error('File size exceeds 16MB limit');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD}`, {
            method: 'POST',
            body: formData
        });

        // Handle HTTP errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
        }

        const data = await response.json();

        // Validate response structure
        if (data.status !== 'success') {
            throw new Error(data.error || 'Upload failed');
        }

        return {
            success: true,
            filename: data.filename,
            layout: data.layout,
            metadata: {
                uploadTime: new Date().toISOString(),
                fileSize: file.size,
                fileName: file.name
            }
        };

    } catch (error) {
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Cannot connect to server. Make sure the backend is running on localhost:5000');
        }
        throw error;
    }
}

/**
 * Process floor plan image (alternative method using base64 or URL)
 * @param {Object} options - Processing options
 * @param {string} [options.image_data] - Base64 encoded image
 * @param {string} [options.image_url] - URL of the image
 * @returns {Promise<Object>} Response with layout data
 * @throws {Error} If processing fails
 */
async function processFloorplan(options = {}) {
    const { image_data, image_url } = options;

    // Validate input
    if (!image_data && !image_url) {
        throw new Error('Either image_data or image_url must be provided');
    }

    // Prepare request body
    const requestBody = {};
    if (image_data) {
        requestBody.image_data = image_data;
    } else if (image_url) {
        requestBody.image_url = image_url;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROCESS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        // Handle HTTP errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
        }

        const data = await response.json();

        // Validate response structure
        if (data.status !== 'success') {
            throw new Error(data.error || 'Processing failed');
        }

        // Validate layout data structure
        if (!data.layout || typeof data.layout !== 'object') {
            throw new Error('Invalid layout data received from server');
        }

        return {
            success: true,
            layout: data.layout,
            metadata: {
                processTime: new Date().toISOString(),
                source: image_data ? 'base64' : 'url'
            }
        };

    } catch (error) {
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Cannot connect to server. Make sure the backend is running on localhost:5000');
        }
        throw error;
    }
}

/**
 * Check if backend server is available
 * @returns {Promise<boolean>} True if server is reachable
 */
async function checkServerHealth() {
    try {
        // Create timeout controller for older browsers
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/`, {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Export functions (for module use) or make available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        uploadImage,
        processFloorplan,
        checkServerHealth,
        API_CONFIG
    };
} else {
    // Make available globally
    window.FloorPlanAPI = {
        uploadImage,
        processFloorplan,
        checkServerHealth,
        API_CONFIG
    };
}

