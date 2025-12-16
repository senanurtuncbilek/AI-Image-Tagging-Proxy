"""test"""
import sys
import os

# Mevcut dizini path'e ekle
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("=" * 50)
print("Python AI Service Test")
print("=" * 50)

try:
    print("\n1. Config import ediliyor...")
    from config import Config
    print(f"   [OK] Config yuklendi - Port: {Config.FLASK_PORT}")
    
    print("\n2. Detector import ediliyor...")
    from utils.detector import YOLODetector
    print("   [OK] Detector modulu yuklendi")
    
    print("\n3. Keyword generator import ediliyor...")
    from utils.keyword_gen import generate_keywords
    print("   [OK] Keyword generator yuklendi")
    
    print("\n4. Flask app import ediliyor...")
    from ai_service import app
    print("   [OK] Flask app yuklendi")
    
    print("\n5. YOLO detector baslatiliyor...")
    detector = YOLODetector()
    print("   [OK] YOLO detector hazir!")
    
    print("\n" + "=" * 50)
    print("[OK] TUM TESTLER BASARILI!")
    print("=" * 50)
    print(f"\nServisi başlatmak için:")
    print(f"  python ai_service.py")
    print(f"\nVeya Flask ile:")
    print(f"  flask --app ai_service run --port 5000")
    
except Exception as e:
    print(f"\n[HATA] {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

