from ultralytics import YOLO
import os
from config import Config
import logging

logger = logging.getLogger(__name__)

class YOLODetector:
    _instance = None
    _model = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(YOLODetector, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if YOLODetector._model is None:
            self.load_model()
    
    def load_model(self):
        """YOLO modelini yükle"""
        try:
            model_path = Config.MODEL_PATH
            
            # Eğer model dosyası yoksa, otomatik indirilecek
            if not os.path.exists(model_path):
                logger.warning(f"Model dosyası bulunamadı: {model_path}. Otomatik indiriliyor...")
                # Model klasörünü oluştur
                os.makedirs(os.path.dirname(model_path), exist_ok=True)
            
            logger.info(f"YOLO modeli yükleniyor: {model_path}")
            YOLODetector._model = YOLO(model_path)
            logger.info("YOLO modeli başarıyla yüklendi!")
        except Exception as e:
            logger.error(f"Model yükleme hatası: {str(e)}")
            raise
    
    def detect(self, image_path: str, confidence: float = None):
        """
        Resimdeki objeleri tespit et
        
        Args:
            image_path: Analiz edilecek resmin yolu
            confidence: Güven eşiği (opsiyonel)
        
        Returns:
            YOLO sonuçları
        """
        if YOLODetector._model is None:
            self.load_model()
        
        conf_threshold = confidence or Config.CONFIDENCE_THRESHOLD
        
        try:
            results = YOLODetector._model(image_path, conf=conf_threshold)
            return results
        except Exception as e:
            logger.error(f"Tespit hatası: {str(e)}")
            raise



