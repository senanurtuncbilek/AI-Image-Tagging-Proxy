from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.detector import YOLODetector
from utils.keyword_gen import generate_keywords
from config import Config
import os
import time
import logging
from collections import Counter

# Logging yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# YOLO detector instance
detector = None

def init_detector():
    """YOLO detector'ı başlat"""
    global detector
    try:
        logger.info("YOLO detector başlatılıyor...")
        detector = YOLODetector()
        logger.info("YOLO detector hazır!")
    except Exception as e:
        logger.error(f"Detector başlatma hatası: {str(e)}")
        raise

@app.before_request
def before_request():
    global detector
    if detector is None:
        init_detector()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'python-ai',
        'model_loaded': detector is not None,
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
    })

@app.route('/process', methods=['POST'])
def process_image():
    """
    Resim analizi endpoint'i
    
    Request body:
    {
        "image_path": "uploads/abc-123.jpg",
        "options": {
            "confidence_threshold": 0.5,
            "max_objects": 50
        }
    }
    """
    start_time = time.time()
    
    try:
        data = request.get_json()
        
        if not data or 'image_path' not in data:
            return jsonify({
                'success': False,
                'error': 'image_path parametresi gerekli'
            }), 400
        
        image_path = data['image_path']
        options = data.get('options', {})
        confidence_threshold = options.get('confidence_threshold', Config.CONFIDENCE_THRESHOLD)
        max_objects = options.get('max_objects', Config.MAX_OBJECTS)
        

        if not os.path.isabs(image_path):
            # Eğer path zaten uploads/ ile başlıyorsa bir üst dizine çık
            if image_path.startswith('uploads/'):
                image_path = os.path.join('..', image_path)
            else:
                # Direkt path ise uploads/ ekle
                image_path = os.path.join('..', 'uploads', os.path.basename(image_path))
        
        logger.info(f"Resim analizi başlatılıyor: {image_path}")
        
        # Dosya var mı kontrol et
        if not os.path.exists(image_path):
            return jsonify({
                'success': False,
                'error': f'Resim dosyası bulunamadı: {image_path}'
            }), 404
        
        # YOLO ile tespit
        results = detector.detect(image_path, confidence=confidence_threshold)
        
        # Sonuçları işle
        object_counts = {}
        all_detections = []
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    class_id = int(box.cls[0])
                    class_name = result.names[class_id]
                    confidence = float(box.conf[0])
                    
                    all_detections.append({
                        'class': class_name,
                        'confidence': confidence
                    })
        
        # Obje sayılarını hesapla
        class_counter = Counter([det['class'] for det in all_detections])
        object_counts = dict(class_counter)
        
        # Max object limiti
        if len(all_detections) > max_objects:
            logger.warning(f"Çok fazla obje tespit edildi ({len(all_detections)}). Limit: {max_objects}")
            # En yüksek confidence olanları al
            sorted_detections = sorted(all_detections, key=lambda x: x['confidence'], reverse=True)
            all_detections = sorted_detections[:max_objects]
            # Yeniden say
            class_counter = Counter([det['class'] for det in all_detections])
            object_counts = dict(class_counter)
        
        # Ortalama confidence
        avg_confidence = sum([det['confidence'] for det in all_detections]) / len(all_detections) if all_detections else 0
        
        # Keywords üret
        keywords = generate_keywords(object_counts)
        
        processing_time = time.time() - start_time
        
        response = {
            'success': True,
            'object_counts': object_counts,
            'keywords': keywords,
            'total_objects': len(all_detections),
            'confidence': round(avg_confidence, 2),
            'processing_time': round(processing_time, 2),
            'model_version': 'YOLOv8n'
        }
        
        logger.info(f"Analiz tamamlandı: {len(all_detections)} obje tespit edildi, {processing_time:.2f}s")
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"İşleme hatası: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'İşleme hatası: {str(e)}'
        }), 500

if __name__ == '__main__':
    # İlk başlatmada modeli yükle
    try:
        init_detector()
        logger.info(f"Python AI Service başlatılıyor: http://{Config.FLASK_HOST}:{Config.FLASK_PORT}")
        app.run(host=Config.FLASK_HOST, port=Config.FLASK_PORT, debug=Config.DEBUG)
    except Exception as e:
        logger.error(f"Servis başlatılamadı: {str(e)}")
        raise

