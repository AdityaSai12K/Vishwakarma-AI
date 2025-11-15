# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Start Backend Server
**Windows:**
```bash
start_backend.bat
```

**Linux/Mac:**
```bash
chmod +x start_backend.sh
./start_backend.sh
```

**Or manually:**
```bash
cd backend
python app.py
```

The server will start on `http://localhost:5000`

### Step 3: Open Frontend
Simply open `frontend/index.html` in your web browser, or use a local server:

```bash
cd frontend
python -m http.server 8000
```

Then navigate to `http://localhost:8000`

## 📝 Usage

1. Click "Choose File" and select a floor plan image
2. Click "Upload & Process"
3. Wait for the 3D model to generate
4. Interact with the model:
   - **Left Click + Drag**: Rotate
   - **Right Click + Drag**: Pan
   - **Scroll**: Zoom
   - **Middle Click**: Reset view
5. Click "Export GLTF" to download the 3D model

## 🎯 Example API Call

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@floor_plan.png"
```

## ⚠️ Troubleshooting

- **Backend won't start**: Make sure port 5000 is available
- **CORS errors**: Ensure backend is running before opening frontend
- **No model appears**: Check browser console for errors
- **OpenCV errors**: Run `pip install opencv-python` again

## 📁 Project Structure

```
├── backend/
│   ├── app.py              # Flask server
│   └── image_processor.py  # Image processing
├── frontend/
│   ├── index.html          # Main UI
│   └── viewer.js           # 3D viewer
└── requirements.txt         # Python deps
```

For detailed documentation, see `README_FLOOR_PLAN.md`

