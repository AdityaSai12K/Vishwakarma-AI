/**
 * Three.js Floor Plan 3D Viewer
 * Renders 3D model from JSON layout data
 */

// Global variables
let scene, camera, renderer, controls;
let currentModel = null;
let stats = null;

// Initialize the 3D viewer
function initViewer() {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        updateStatus('Error: Three.js library not loaded', 'error');
        return;
    }
    
    const container = document.getElementById('canvas-container');
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Add orbit controls
    if (typeof OrbitControls !== 'undefined') {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 50;
    } else {
        console.warn('OrbitControls not found. Camera controls may be limited.');
    }
    
    // Add lighting
    setupLighting();
    
    // Add floor grid
    addFloorGrid();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Handle middle click to reset view
    renderer.domElement.addEventListener('mousedown', (e) => {
        if (e.button === 1) { // Middle mouse button
            e.preventDefault();
            resetCamera();
        }
    });
    
    // Start animation loop
    animate();
    
    // Initialize stats
    initStats();
    
    updateStatus('3D viewer initialized', 'success');
}

/**
 * Setup lighting for the scene
 */
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);
    
    // Hemisphere light for softer shadows
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);
}

/**
 * Add floor grid for reference
 */
function addFloorGrid() {
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(gridHelper);
    
    // Add a floor plane
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
}

/**
 * Render 3D model from JSON layout data
 * This is the main function that takes JSON and builds the 3D scene
 * @param {Object} layoutData - JSON layout data with walls, doors, windows
 * @param {Object} [metadata] - Optional metadata about the layout
 */
function render3DModel(layoutData, metadata = {}) {
    // Validate input
    if (!layoutData || typeof layoutData !== 'object') {
        throw new Error('Invalid layout data provided');
    }

    // Clear existing model
    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
    }
    
    // Create a group to hold all model elements
    const modelGroup = new THREE.Group();
    
    // Build walls
    if (layoutData.walls && Array.isArray(layoutData.walls) && layoutData.walls.length > 0) {
        layoutData.walls.forEach((wall, index) => {
            try {
                const wallMesh = createWall(wall);
                if (wallMesh) {
                    modelGroup.add(wallMesh);
                }
            } catch (error) {
                console.warn(`Failed to create wall ${index}:`, error);
            }
        });
    }
    
    // Build doors
    if (layoutData.doors && Array.isArray(layoutData.doors) && layoutData.doors.length > 0) {
        layoutData.doors.forEach((door, index) => {
            try {
                const doorMesh = createDoor(door);
                if (doorMesh) {
                    modelGroup.add(doorMesh);
                }
            } catch (error) {
                console.warn(`Failed to create door ${index}:`, error);
            }
        });
    }
    
    // Build windows
    if (layoutData.windows && Array.isArray(layoutData.windows) && layoutData.windows.length > 0) {
        layoutData.windows.forEach((window, index) => {
            try {
                const windowMesh = createWindow(window);
                if (windowMesh) {
                    modelGroup.add(windowMesh);
                }
            } catch (error) {
                console.warn(`Failed to create window ${index}:`, error);
            }
        });
    }
    
    // Check if model has any elements
    if (modelGroup.children.length === 0) {
        throw new Error('No valid elements found in layout data');
    }
    
    // Center the model
    centerModel(modelGroup);
    
    // Add to scene
    scene.add(modelGroup);
    currentModel = modelGroup;
    
    // Update camera to fit model
    fitCameraToModel(modelGroup);
    
    // Enable export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.disabled = false;
    }
    
    // Log metadata if provided
    if (metadata && Object.keys(metadata).length > 0) {
        console.log('Model metadata:', metadata);
    }
}

/**
 * Create a wall mesh from wall data
 */
function createWall(wall) {
    // Validate wall data
    if (!wall.start || !wall.end || !Array.isArray(wall.start) || !Array.isArray(wall.end)) {
        throw new Error('Invalid wall data: start and end must be arrays');
    }

    const start = new THREE.Vector3(wall.start[0], 0, wall.start[1]);
    const end = new THREE.Vector3(wall.end[0], 0, wall.end[1]);
    
    // Calculate wall length and direction
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const height = 2.5; // Standard wall height in meters
    const thickness = wall.thickness || 0.2;
    
    if (length < 0.1) return null; // Skip very short walls
    
    // Create wall geometry
    const geometry = new THREE.BoxGeometry(length, height, thickness);
    
    // Create wall material
    const material = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.7,
        metalness: 0.1
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Position and rotate wall
    const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mesh.position.set(center.x, height / 2, center.z);
    
    // Calculate rotation angle
    direction.normalize();
    const angle = Math.atan2(direction.x, direction.z);
    mesh.rotation.y = angle;
    
    return mesh;
}

/**
 * Create a door mesh from door data
 */
function createDoor(door) {
    // Validate door data
    if (!door.position || !Array.isArray(door.position)) {
        throw new Error('Invalid door data: position must be an array');
    }

    const position = door.position;
    const width = door.width || 0.9;
    const height = 2.1; // Standard door height
    const depth = 0.1;
    
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
        color: 0x8b4513, // Brown door color
        roughness: 0.6,
        metalness: 0.2
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], height / 2, position[1]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Apply rotation if specified
    if (door.rotation) {
        mesh.rotation.y = (door.rotation * Math.PI) / 180;
    }
    
    return mesh;
}

/**
 * Create a window mesh from window data
 */
function createWindow(window) {
    // Validate window data
    if (!window.position || !Array.isArray(window.position)) {
        throw new Error('Invalid window data: position must be an array');
    }

    const position = window.position;
    const width = window.width || 1.2;
    const height = window.height || 1.0;
    const depth = 0.15;
    
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
        color: 0x87ceeb, // Sky blue window color
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.7
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], height / 2 + 0.5, position[1]); // Position at wall height
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Apply rotation if specified
    if (window.rotation) {
        mesh.rotation.y = (window.rotation * Math.PI) / 180;
    }
    
    return mesh;
}

/**
 * Center the model in the scene
 */
function centerModel(modelGroup) {
    const box = new THREE.Box3().setFromObject(modelGroup);
    const center = box.getCenter(new THREE.Vector3());
    modelGroup.position.sub(center);
}

/**
 * Fit camera to model
 */
function fitCameraToModel(modelGroup) {
    const box = new THREE.Box3().setFromObject(modelGroup);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.5; // Add some padding
    
    camera.position.set(center.x + cameraZ * 0.7, center.y + cameraZ * 0.7, center.z + cameraZ * 0.7);
    camera.lookAt(center);
    if (controls) {
        controls.target.copy(center);
        controls.update();
    }
}

/**
 * Reset camera to default position
 */
function resetCamera() {
    if (currentModel) {
        fitCameraToModel(currentModel);
    } else {
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);
        if (controls) {
            controls.target.set(0, 0, 0);
            controls.update();
        }
    }
}

/**
 * Handle window resize
 */
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

/**
 * Animation loop
 */
function animate() {
    requestAnimationFrame(animate);
    if (controls) {
        controls.update();
    }
    renderer.render(scene, camera);
    
    // Update stats
    if (stats) {
        stats.update();
    }
}

/**
 * Initialize stats display
 */
function initStats() {
    stats = {
        update: function() {
            const statsDiv = document.getElementById('stats');
            if (currentModel) {
                const box = new THREE.Box3().setFromObject(currentModel);
                const size = box.getSize(new THREE.Vector3());
                const wallCount = currentModel.children.filter(c => 
                    c.material && c.material.color && c.material.color.getHex() === 0xcccccc
                ).length;
                statsDiv.innerHTML = `
                    <div>Walls: ${wallCount}</div>
                    <div>Doors: ${currentModel.children.filter(c => 
                        c.material && c.material.color && c.material.color.getHex() === 0x8b4513
                    ).length}</div>
                    <div>Windows: ${currentModel.children.filter(c => 
                        c.material && c.material.transparent === true
                    ).length}</div>
                    <div>Size: ${size.x.toFixed(1)}m × ${size.y.toFixed(1)}m × ${size.z.toFixed(1)}m</div>
                `;
            } else {
                statsDiv.innerHTML = 'No model loaded';
            }
        }
    };
}

/**
 * Export model as GLTF
 */
function exportGLTF() {
    if (!currentModel) {
        updateStatus('No model to export', 'error');
        return;
    }
    
    // Check if GLTFExporter is available
    if (typeof GLTFExporter === 'undefined') {
        updateStatus('GLTF Exporter not available. Please check script loading.', 'error');
        return;
    }
    
    updateStatus('Exporting GLTF...', 'info');
    
    const exporter = new GLTFExporter();
    
    exporter.parse(
        currentModel,
        (result) => {
            const output = JSON.stringify(result, null, 2);
            const blob = new Blob([output], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'floor_plan.gltf';
            link.click();
            URL.revokeObjectURL(url);
            updateStatus('GLTF exported successfully!', 'success');
        },
        { binary: false }
    );
}

/**
 * Update status message
 */
function updateStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
    }
}

/**
 * Show loading indicator
 */
function showLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.classList.add('active');
    }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.classList.remove('active');
    }
}

// Make render3DModel available globally
window.render3DModel = render3DModel;
window.exportGLTF = exportGLTF;
