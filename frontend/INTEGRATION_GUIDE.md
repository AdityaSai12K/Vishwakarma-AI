# Frontend-Backend Integration Guide

## Architecture Overview

The frontend is now modularized into three main files:

1. **`api.js`** - API communication layer
2. **`viewer.js`** - Three.js 3D rendering engine
3. **`app.js`** - Application controller and workflow orchestration

## Workflow: Upload → Backend → JSON → Three.js → 3D Model

```
User selects file
    ↓
app.js: handleFileUpload()
    ↓
api.js: uploadImage() → POST /api/upload
    ↓
Backend processes image → returns JSON layout
    ↓
app.js: receives layout data
    ↓
viewer.js: render3DModel(json) → builds 3D scene
    ↓
3D model displayed in browser
```

## API Functions

### `uploadImage(file)`
- **Location**: `api.js`
- **Purpose**: Upload image file to backend
- **Endpoint**: `POST /api/upload`
- **Returns**: `{ success, filename, layout, metadata }`
- **Error Handling**: Validates file type, size, and network errors

### `processFloorplan(options)`
- **Location**: `api.js`
- **Purpose**: Process image from base64 or URL
- **Endpoint**: `POST /api/process`
- **Parameters**: `{ image_data?: string, image_url?: string }`
- **Returns**: `{ success, layout, metadata }`

### `render3DModel(json, metadata)`
- **Location**: `viewer.js`
- **Purpose**: Build 3D model from JSON layout data
- **Parameters**: 
  - `json`: Layout object with `walls`, `doors`, `windows`
  - `metadata`: Optional metadata object
- **Side Effects**: Updates Three.js scene, enables export button

## JSON Format

The backend returns JSON in this format:

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

## Error Handling

All API functions include comprehensive error handling:

- **Network errors**: Detects connection failures
- **Validation errors**: File type, size, format validation
- **Server errors**: HTTP status code handling
- **Data errors**: JSON structure validation

Errors are displayed in the UI status area with appropriate styling.

## Loading Indicators

The application shows loading indicators during:
- Image upload
- Image processing
- 3D model rendering

Use `showLoading()` and `hideLoading()` functions from `viewer.js`.

## Server Health Check

On application startup, `checkServerHealth()` verifies backend connectivity:
- Checks `GET /` endpoint
- 3-second timeout
- Shows warning if server unavailable

## Usage Examples

### Basic Upload Workflow
```javascript
const file = document.getElementById('fileInput').files[0];
await handleFileUpload(file);
```

### Process from Base64
```javascript
const base64Data = 'data:image/png;base64,iVBORw0KG...';
await handleProcessImage({ image_data: base64Data });
```

### Process from URL
```javascript
await handleProcessImage({ 
    image_url: 'https://example.com/floorplan.png' 
});
```

### Manual 3D Rendering
```javascript
const layoutData = {
    walls: [...],
    doors: [...],
    windows: [...]
};
render3DModel(layoutData, { custom: 'metadata' });
```

## Configuration

API endpoint configuration is in `api.js`:

```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000',
    ENDPOINTS: {
        UPLOAD: '/api/upload',
        PROCESS: '/api/process'
    }
};
```

Change `BASE_URL` to point to a different server if needed.

## Testing

1. **Start backend**: `python backend/app.py`
2. **Open frontend**: Open `frontend/index.html` in browser
3. **Upload image**: Select a floor plan image
4. **Verify workflow**: Check browser console for logs
5. **Test error cases**: Try invalid files, disconnect backend

## Troubleshooting

### "Cannot connect to server"
- Verify backend is running on `localhost:5000`
- Check CORS settings in Flask app
- Verify firewall/antivirus isn't blocking

### "Invalid layout data"
- Check backend response format
- Verify JSON structure matches expected format
- Check browser console for detailed errors

### "No valid elements found"
- Image processing may have failed
- Check if walls/doors/windows arrays are empty
- Verify image quality and format

