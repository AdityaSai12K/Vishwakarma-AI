"""
Flask backend for floor plan processing
Main application entry point
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from image_processor import ImageProcessor

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize image processor
processor = ImageProcessor()


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Floor Plan Processing API',
        'endpoints': {
            'upload': '/api/upload',
            'process': '/api/process'
        }
    })


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """
    Endpoint to upload a 2D floor plan image
    Returns: JSON with file info and processing status
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, GIF, BMP'}), 400
    
    try:
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Process image and detect layout
        layout_data = processor.process_image(filepath)
        
        return jsonify({
            'status': 'success',
            'filename': filename,
            'layout': layout_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Processing failed',
            'message': str(e)
        }), 500


@app.route('/api/process', methods=['POST'])
def process_image():
    """
    Alternative endpoint: process image from base64 or URL
    Accepts JSON with 'image_data' (base64) or 'image_url'
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Handle base64 image
        if 'image_data' in data:
            layout_data = processor.process_base64_image(data['image_data'])
            return jsonify({
                'status': 'success',
                'layout': layout_data
            }), 200
        
        # Handle image URL
        elif 'image_url' in data:
            layout_data = processor.process_image_url(data['image_url'])
            return jsonify({
                'status': 'success',
                'layout': layout_data
            }), 200
        
        else:
            return jsonify({'error': 'Provide image_data or image_url'}), 400
            
    except Exception as e:
        return jsonify({
            'error': 'Processing failed',
            'message': str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

