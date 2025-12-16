from collections import Counter
import logging

logger = logging.getLogger(__name__)

# Context-based keyword mapping
CONTEXT_KEYWORDS = {
    # İnsanlar
    'person': ['people', 'human', 'crowd', 'outdoor', 'indoor'],
    'man': ['person', 'male', 'people'],
    'woman': ['person', 'female', 'people'],
    
    # Taşıtlar
    'car': ['vehicle', 'automobile', 'street', 'road', 'traffic', 'outdoor'],
    'truck': ['vehicle', 'transport', 'road', 'outdoor'],
    'bus': ['vehicle', 'public transport', 'road', 'outdoor'],
    'motorcycle': ['vehicle', 'two-wheeler', 'road', 'outdoor'],
    'bicycle': ['bike', 'cycling', 'outdoor', 'sport'],
    
    # Hayvanlar
    'cat': ['pet', 'animal', 'feline', 'indoor', 'outdoor'],
    'dog': ['pet', 'animal', 'canine', 'outdoor', 'indoor'],
    'bird': ['animal', 'wildlife', 'outdoor', 'nature'],
    'horse': ['animal', 'farm', 'outdoor', 'nature'],
    
    # Mobilya
    'chair': ['furniture', 'indoor', 'room', 'interior'],
    'sofa': ['furniture', 'indoor', 'room', 'interior'],
    'bed': ['furniture', 'indoor', 'room', 'bedroom'],
    'table': ['furniture', 'indoor', 'room', 'interior'],
    
    # Elektronik
    'laptop': ['technology', 'computer', 'indoor', 'office'],
    'cell phone': ['technology', 'mobile', 'device', 'indoor'],
    'tv': ['technology', 'television', 'indoor', 'room'],
    
    # Yiyecek
    'bottle': ['drink', 'container', 'indoor', 'outdoor'],
    'cup': ['drink', 'container', 'indoor'],
    'bowl': ['food', 'container', 'indoor'],
    
    # Spor
    'sports ball': ['sport', 'outdoor', 'indoor', 'game'],
    'tennis racket': ['sport', 'outdoor', 'game'],
    'skateboard': ['sport', 'outdoor', 'recreation'],
}

# Genel context keywords
GENERAL_KEYWORDS = {
    'outdoor': ['street', 'road', 'park', 'nature', 'building', 'sky'],
    'indoor': ['room', 'interior', 'furniture', 'wall', 'ceiling'],
    'daytime': ['bright', 'sunny', 'light'],
    'nighttime': ['dark', 'night', 'artificial light']
}

def generate_keywords(detected_objects: dict, image_context: dict = None) -> list:
    """
    Tespit edilen objelere göre keyword listesi oluştur
    
    Args:
        detected_objects: {object_name: count} formatında dict
        image_context: Ek context bilgisi (opsiyonel)
    
    Returns:
        Keyword listesi
    """
    keywords = set()
    
    # 1. Tespit edilen objeleri ekle
    for obj_name in detected_objects.keys():
        obj_lower = obj_name.lower()
        keywords.add(obj_lower)
        
        # Context keywords ekle
        if obj_lower in CONTEXT_KEYWORDS:
            keywords.update(CONTEXT_KEYWORDS[obj_lower])
    
    # 2. En çok tespit edilen objeleri vurgula
    if detected_objects:
        sorted_objects = sorted(detected_objects.items(), key=lambda x: x[1], reverse=True)
        top_objects = [obj[0].lower() for obj in sorted_objects[:3]]
        keywords.update(top_objects)
    
    # 3. Genel context ekle (basit heuristik)
    # Eğer çok sayıda person varsa -> crowd, people
    if 'person' in detected_objects and detected_objects['person'] > 2:
        keywords.add('crowd')
        keywords.add('people')
    
    # Eğer araç varsa -> outdoor, street
    vehicles = ['car', 'truck', 'bus', 'motorcycle', 'bicycle']
    if any(veh in detected_objects for veh in vehicles):
        keywords.add('outdoor')
        keywords.add('street')
        keywords.add('road')
    
    # Eğer mobilya varsa -> indoor
    furniture = ['chair', 'sofa', 'bed', 'table', 'couch']
    if any(furn in detected_objects for furn in furniture):
        keywords.add('indoor')
        keywords.add('interior')
    
    return sorted(list(keywords))



