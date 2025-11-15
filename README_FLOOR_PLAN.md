# Floor Plan 3D Viewer

A full-stack application that converts 2D floor plan images into interactive 3D models using Three.js and Flask.

## Features

- **Image Upload**: Upload 2D floor plan images (PNG, JPG, JPEG, GIF, BMP)
- **AI-Powered Detection**: Automatic detection of walls, doors, and windows using OpenCV
- **3D Visualization**: Interactive 3D model rendering with Three.js
- **GLTF Export**: Export 3D models as GLTF files
- **Modern UI**: Clean, responsive interface with intuitive controls

## Project Structure

```
.
├── backend/
│   ├── __init__.py
│   ├── app.py              # Flask application
│   └── image_processor.py  # Image processing and detection logic
├── frontend/
│   ├── index.html          # Main HTML file
│   └── viewer.js           # Three.js 3D viewer logic
├── requirements.txt        # Python dependencies
└── README_FLOOR_PLAN.md    # This file
```

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Edge)

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Flask server:**
   ```bash
   cd backend
   python app.py
   ```
   
   The server will start on `http://localhost:5000`

### Frontend Setup

1. **Open the frontend:**
   - Simply open `frontend/index.html` in your web browser
   - Or use a local web server:
     ```bash
     # Using Python
     cd frontend
     python -m http.server 8000
     ```
     Then navigate to `http://localhost:8000`

2. **Note:** If using a different port for the backend, update the `API_URL` in `frontend/viewer.js`:
   ```javascript
   const API_URL = 'http://localhost:5000/api/upload';
   ```

## Usage

1. **Start the backend server** (Flask app)
2. **Open the frontend** in your browser
3. **Upload a floor plan image** using the file input
4. **View the 3D model** that's automatically generated
5. **Interact with the model:**
   - Left Click + Drag: Rotate camera
   - Right Click + Drag: Pan view
   - Scroll: Zoom in/out
   - Middle Click: Reset view
6. **Export as GLTF** using the export button

## API Endpoints

### POST `/api/upload`
Upload a floor plan image file.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `file` (image file)

**Response:**
```json
{
  "status": "success",
  "filename": "floor_plan.png",
  "layout": {
    "walls": [
      {
        "start": [0, 0],
        "end": [8, 0],
        "thickness": 0.2
      }
    ],
    "doors": [
      {
        "position": [4, 0],
        "width": 0.9,
        "rotation": 0
      }
    ],
    "windows": [
      {
        "position": [2, 0],
        "width": 1.2,
        "height": 1.0,
        "rotation": 0
      }
    ]
  }
}
```

### POST `/api/process`
Process image from base64 or URL.

**Request:**
```json
{
  "image_data": "base64_string_here"
}
```
or
```json
{
  "image_url": "https://example.com/image.png"
}
```

## Technical Details

### Image Processing

The backend uses OpenCV for image processing:
- **Walls**: Detected using Hough Line Transform
- **Doors**: Detected using contour analysis (rectangular shapes with specific aspect ratios)
- **Windows**: Detected using polygon approximation (4-vertex rectangles)

### 3D Rendering

The frontend uses Three.js for 3D rendering:
- Walls are extruded boxes with standard height (2.5m)
- Doors are brown rectangular meshes (2.1m height)
- Windows are semi-transparent blue meshes
- Lighting includes ambient, directional, and hemisphere lights
- Shadows are enabled for realistic rendering

### Coordinate System

- Input images are normalized to a 10m × 10m coordinate space
- 3D models use standard metric units (meters)
- Y-axis is up (standard 3D convention)

## Customization

### Adjusting Detection Parameters

Edit `backend/image_processor.py`:
- `wall_thickness`: Default wall thickness (default: 0.2m)
- `scale_factor`: Pixel to meter conversion
- Detection thresholds in `_detect_walls()`, `_detect_doors()`, `_detect_windows()`

### Adjusting 3D Model Appearance

Edit `frontend/viewer.js`:
- Wall height: Change `height` in `createWall()` (default: 2.5m)
- Door height: Change `height` in `createDoor()` (default: 2.1m)
- Colors: Modify material colors in respective functions
- Lighting: Adjust light intensities in `setupLighting()`

## Troubleshooting

### Backend Issues

- **Port already in use**: Change port in `backend/app.py` (line: `app.run(..., port=5000)`)
- **OpenCV not found**: Ensure `opencv-python` is installed: `pip install opencv-python`
- **CORS errors**: Flask-CORS is already configured, but check if backend is running

### Frontend Issues

- **Model not loading**: Check browser console for errors, verify API_URL is correct
- **GLTF export not working**: Ensure Three.js GLTFExporter is loaded correctly
- **Controls not responding**: Check if OrbitControls script is loaded

## Future Enhancements

- [ ] Support for multiple rooms/floors
- [ ] Furniture placement
- [ ] Material textures
- [ ] Real-time editing
- [ ] Advanced AI detection (using ML models)
- [ ] VR/AR support
- [ ] Measurement tools

## License

This project is provided as-is for educational and development purposes.

## Contributing

Feel free to submit issues and enhancement requests!

