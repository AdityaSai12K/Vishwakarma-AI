"""
Image processing module for floor plan analysis
Detects walls, doors, and windows using OpenCV
"""

import cv2
import numpy as np
import os
import base64
import urllib.request
from typing import Dict, List, Tuple


class ImageProcessor:
    """
    Processes floor plan images to detect architectural elements
    """
    
    def __init__(self):
        """Initialize processor with default parameters"""
        self.wall_thickness = 0.2  # Default wall thickness in meters
        self.scale_factor = 0.01   # Pixel to meter conversion (adjust based on image)
        
    def process_image(self, image_path: str) -> Dict:
        """
        Process image file and return structured layout data
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary with walls, doors, and windows data
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
        
        return self._detect_layout(image)
    
    def process_base64_image(self, base64_string: str) -> Dict:
        """
        Process base64 encoded image
        
        Args:
            base64_string: Base64 encoded image data
            
        Returns:
            Dictionary with walls, doors, and windows data
        """
        # Decode base64
        image_data = base64.b64decode(base64_string.split(',')[-1])
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Could not decode base64 image")
        
        return self._detect_layout(image)
    
    def process_image_url(self, image_url: str) -> Dict:
        """
        Process image from URL
        
        Args:
            image_url: URL of the image
            
        Returns:
            Dictionary with walls, doors, and windows data
        """
        # Download image
        with urllib.request.urlopen(image_url) as response:
            image_data = response.read()
        
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Could not load image from URL")
        
        return self._detect_layout(image)
    
    def _detect_layout(self, image: np.ndarray) -> Dict:
        """
        Main detection function - detects walls, doors, and windows
        
        Args:
            image: OpenCV image array
            
        Returns:
            Structured layout dictionary
        """
        # Get image dimensions
        height, width = image.shape[:2]
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply threshold to get binary image
        _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
        
        # Detect walls using line detection
        walls = self._detect_walls(binary, width, height)
        
        # Detect doors (typically smaller openings in walls)
        doors = self._detect_doors(binary, width, height, walls)
        
        # Detect windows (typically rectangular openings)
        windows = self._detect_windows(binary, width, height, walls)
        
        return {
            "walls": walls,
            "doors": doors,
            "windows": windows
        }
    
    def _detect_walls(self, binary: np.ndarray, width: int, height: int) -> List[Dict]:
        """
        Detect walls using Hough Line Transform
        
        Args:
            binary: Binary image
            width: Image width
            height: Image height
            
        Returns:
            List of wall dictionaries with start/end coordinates
        """
        walls = []
        
        # Use HoughLinesP for line detection
        lines = cv2.HoughLinesP(
            binary,
            rho=1,
            theta=np.pi/180,
            threshold=50,
            minLineLength=30,
            maxLineGap=10
        )
        
        if lines is not None:
            for line in lines:
                x1, y1, x2, y2 = line[0]
                
                # Convert pixel coordinates to normalized coordinates (0-1 range)
                # Then scale to reasonable meter values
                start_x = (x1 / width) * 10.0  # Scale to 10m max
                start_y = (y1 / height) * 10.0
                end_x = (x2 / width) * 10.0
                end_y = (y2 / height) * 10.0
                
                # Filter out very short lines (noise)
                length = np.sqrt((end_x - start_x)**2 + (end_y - start_y)**2)
                if length > 0.5:  # Minimum wall length of 0.5m
                    walls.append({
                        "start": [round(start_x, 2), round(start_y, 2)],
                        "end": [round(end_x, 2), round(end_y, 2)],
                        "thickness": self.wall_thickness
                    })
        
        # If no walls detected, create a simple rectangular room as fallback
        if len(walls) == 0:
            walls = self._create_default_room(width, height)
        
        return walls
    
    def _detect_doors(self, binary: np.ndarray, width: int, height: int, walls: List[Dict]) -> List[Dict]:
        """
        Detect doors in the floor plan
        Doors are typically small openings or gaps in walls
        
        Args:
            binary: Binary image
            width: Image width
            height: Image height
            walls: Detected walls list
            
        Returns:
            List of door dictionaries
        """
        doors = []
        
        # Use contour detection to find door-like shapes
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(contour)
            
            # Doors are typically wider than tall, and of moderate size
            aspect_ratio = w / h if h > 0 else 0
            area = w * h
            
            # Door characteristics: aspect ratio > 1.5, area between thresholds
            if 1.5 < aspect_ratio < 4.0 and 100 < area < 2000:
                # Convert to normalized coordinates
                center_x = ((x + w/2) / width) * 10.0
                center_y = ((y + h/2) / height) * 10.0
                door_width = (w / width) * 10.0
                
                doors.append({
                    "position": [round(center_x, 2), round(center_y, 2)],
                    "width": round(door_width, 2),
                    "rotation": 0  # Can be enhanced to detect rotation
                })
        
        return doors
    
    def _detect_windows(self, binary: np.ndarray, width: int, height: int, walls: List[Dict]) -> List[Dict]:
        """
        Detect windows in the floor plan
        Windows are typically rectangular openings in walls
        
        Args:
            binary: Binary image
            width: Image width
            height: Image height
            walls: Detected walls list
            
        Returns:
            List of window dictionaries
        """
        windows = []
        
        # Use contour detection with rectangular approximation
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            # Approximate contour to polygon
            epsilon = 0.02 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)
            
            # Windows are typically rectangular (4 vertices)
            if len(approx) == 4:
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / h if h > 0 else 0
                area = w * h
                
                # Window characteristics: roughly square or slightly rectangular
                if 0.7 < aspect_ratio < 1.5 and 50 < area < 1500:
                    # Convert to normalized coordinates
                    center_x = ((x + w/2) / width) * 10.0
                    center_y = ((y + h/2) / height) * 10.0
                    window_width = (w / width) * 10.0
                    window_height = (h / height) * 10.0
                    
                    windows.append({
                        "position": [round(center_x, 2), round(center_y, 2)],
                        "width": round(window_width, 2),
                        "height": round(window_height, 2),
                        "rotation": 0
                    })
        
        return windows
    
    def _create_default_room(self, width: int, height: int) -> List[Dict]:
        """
        Create a default rectangular room if no walls are detected
        This serves as a fallback for testing
        
        Args:
            width: Image width
            height: Image height
            
        Returns:
            List of 4 walls forming a rectangle
        """
        # Create a 8m x 6m room
        room_width = 8.0
        room_height = 6.0
        
        return [
            {"start": [0, 0], "end": [room_width, 0], "thickness": self.wall_thickness},
            {"start": [room_width, 0], "end": [room_width, room_height], "thickness": self.wall_thickness},
            {"start": [room_width, room_height], "end": [0, room_height], "thickness": self.wall_thickness},
            {"start": [0, room_height], "end": [0, 0], "thickness": self.wall_thickness}
        ]

