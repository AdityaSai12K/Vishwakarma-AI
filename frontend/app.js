/**
 * Main Application Controller
 * Orchestrates the workflow: Upload → Backend → JSON → Three.js → 3D Model
 */

// Check if API module is loaded
if (typeof FloorPlanAPI === 'undefined') {
    console.error('API module not loaded. Make sure api.js is included before app.js');
}

/**
 * Main workflow: Handle file upload and process
 */
async function handleFileUpload(file) {
    // Validate file
    if (!file) {
        updateStatus('Please select a file first', 'error');
        return;
    }

    // Show loading indicator
    showLoading();
    updateStatus('Uploading image to server...', 'info');

    try {
        // Step 1: Upload image to backend
        const uploadResult = await FloorPlanAPI.uploadImage(file);
        
        if (!uploadResult.success) {
            throw new Error('Upload failed');
        }

        updateStatus('Image uploaded successfully. Processing floor plan...', 'info');

        // Step 2: Get layout data from upload response
        // Note: /api/upload already processes and returns layout
        const layoutData = uploadResult.layout;
        const metadata = uploadResult.metadata;

        if (!layoutData) {
            throw new Error('No layout data received from server');
        }

        updateStatus('Layout detected. Building 3D model...', 'info');

        // Step 3: Render 3D model from JSON
        render3DModel(layoutData, metadata);

        updateStatus('3D model rendered successfully!', 'success');

    } catch (error) {
        console.error('Error in workflow:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Alternative workflow: Process image using /api/process endpoint
 * Useful for processing images from base64 or URL
 */
async function handleProcessImage(options) {
    showLoading();
    updateStatus('Processing image...', 'info');

    try {
        // Call process endpoint
        const result = await FloorPlanAPI.processFloorplan(options);
        
        if (!result.success) {
            throw new Error('Processing failed');
        }

        updateStatus('Processing complete. Building 3D model...', 'info');

        // Render 3D model
        render3DModel(result.layout, result.metadata);

        updateStatus('3D model rendered successfully!', 'success');

    } catch (error) {
        console.error('Error processing image:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Initialize application
 */
async function initApp() {
    // Check server health on startup
    updateStatus('Checking server connection...', 'info');
    
    const isServerAvailable = await FloorPlanAPI.checkServerHealth();
    
    if (!isServerAvailable) {
        updateStatus('Warning: Cannot connect to backend server. Make sure it\'s running on localhost:5000', 'error');
    } else {
        updateStatus('Server connected. Ready to upload floor plan image', 'success');
    }

    // Initialize 3D viewer
    initViewer();

    // Setup event listeners
    setupEventListeners();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const exportBtn = document.getElementById('exportBtn');

    // File input change handler
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleFileUpload(file);
            }
        });
    }

    // Upload button click handler
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            const fileInput = document.getElementById('fileInput');
            if (fileInput && fileInput.files.length > 0) {
                handleFileUpload(fileInput.files[0]);
            } else {
                updateStatus('Please select a file first', 'error');
            }
        });
    }

    // Export button click handler
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (typeof exportGLTF === 'function') {
                exportGLTF();
            } else {
                updateStatus('Export function not available', 'error');
            }
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

