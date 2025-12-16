# AI Image Tagging API

A mini version of Instagram's automatic hashtag suggestions and Google Photos' smart search feature. Upload images, analyze them with AI, detect objects, and automatically generate keywords.

## Technologies Used

- Node.js, Express, TypeScript
- Python, Flask
- YOLO v8 (Ultralytics)
- Multer, Axios, Winston
- Docker

## Architecture

```
┌─────────────────┐
│     CLIENT      │
│ (Postman/App)   │
└────────┬────────┘
         │ HTTP POST
         ↓
┌─────────────────────────────┐
│   NODE.JS API (Port 3000)   │
│  • File upload              │
│  • Request management       │
│  • Response formatting      │
└────────┬────────────────────┘
         │ HTTP POST
         ↓
┌─────────────────────────────┐
│  PYTHON AI (Port 5000)      │
│  • YOLO model               │
│  • Object detection         │
│  • Keyword generation       │
└─────────────────────────────┘
```


### Input Image

![Example Image](uploads/08b3ccce-0ee9-4682-9d83-d869bc31f17b.JPG)

### Analysis Result

```json
{
  "success": true,
  "image_id": "08b3ccce-0ee9-4682-9d83-d869bc31f17b",
  "filename": "DSCF7195.JPG",
  "size_bytes": 6211160,
  "uploaded_at": "2025-12-16T18:45:49.164Z",
  "analysis": {
    "object_counts": {
      "cat": 1
    },
    "keywords": [
      "animal",
      "cat",
      "feline",
      "indoor",
      "outdoor",
      "pet"
    ],
    "total_objects": 1,
    "confidence": 0.66
  },
  "processing_time_ms": 2516,
  "model_version": "YOLOv8n"
}
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/senanurtuncbilek/AI-Image-Tagging-API.git
cd "AI Image Tagging Api"
```

### 2. Setup Node.js API Service

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

Node.js API will run on: http://localhost:3000

### 3. Setup Python AI Service

```bash
# Navigate to python-ai directory
cd python-ai

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Start Python service
python ai_service.py
```

Python AI Service will run on: http://localhost:5000

**Note:** On first run, YOLO model will be automatically downloaded (~6MB).

### 4. Test the API

1. Import `postman_collection.json`
2. Select "Analyze Image" request
3. Set method to `POST`
4. URL: `http://localhost:3000/api/analyze`
5. Body → form-data
6. Key: `image` (type: File)
7. Select an image and send


## Project Structure

```
.
├── src/                    # Node.js API source code
│   ├── server.ts          # Main server file
│   ├── routes/            # API routes
│   │   └── analyze.route.ts
│   ├── services/          # Business logic
│   │   └── ai.service.ts
│   ├── middlewares/       # Middlewares
│   │   ├── upload.middleware.ts
│   │   └── error.middleware.ts
│   └── utils/             # Utilities
│       └── logger.ts
├── python-ai/              # Python AI service
│   ├── ai_service.py      # Flask application
│   ├── config.py          # Configuration
│   ├── utils/             # Utilities
│   │   ├── detector.py   # YOLO wrapper
│   │   └── keyword_gen.py # Keyword generator
│   └── models/            # AI models
│       └── yolov8n.pt     # YOLO model file
├── uploads/               # Uploaded images
├── logs/                  # Log files
├── docker-compose.yml     # Docker configuration
└── README.md
```

## API Endpoints

### POST /api/analyze

Upload and analyze an image.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `image` (file)

**Supported formats:** JPG, PNG, WEBP
**Max file size:** 10MB

**Response:**
```json
{
  "success": true,
  "image_id": "abc-123-def",
  "filename": "street.jpg",
  "size_bytes": 245760,
  "uploaded_at": "2025-12-16T18:45:49.164Z",
  "analysis": {
    "object_counts": {
      "person": 3,
      "car": 2,
      "bicycle": 1
    },
    "keywords": [
      "person",
      "car",
      "bicycle",
      "street",
      "outdoor"
    ],
    "total_objects": 6,
    "confidence": 0.87
  },
  "processing_time_ms": 1240,
  "model_version": "YOLOv8n"
}
```

### GET /health

Health check endpoint for Node.js API.

**Response:**
```json
{
  "status": "ok",
  "service": "node-api",
  "timestamp": "2025-12-16T18:45:49.164Z"
}
```

### GET /health (Python AI)

Health check endpoint for Python AI service.

**Response:**
```json
{
  "status": "ok",
  "service": "python-ai",
  "model_loaded": true,
  "timestamp": "2025-12-16 18:45:49"
}
```

## Docker Deployment

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build

**Node.js API:**
```bash
docker build -f Dockerfile.node -t node-api .
docker run -p 3000:3000 node-api
```

**Python AI:**
```bash
cd python-ai
docker build -t python-ai .
docker run -p 5000:5000 python-ai
```



