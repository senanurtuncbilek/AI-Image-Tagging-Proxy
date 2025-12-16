import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask Configuration
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # YOLO Model Configuration
    MODEL_PATH = os.getenv('MODEL_PATH', 'models/yolov8n.pt')
    CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', 0.5))
    MAX_OBJECTS = int(os.getenv('MAX_OBJECTS', 50))
    
    # Image Processing
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', '../uploads')
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}



