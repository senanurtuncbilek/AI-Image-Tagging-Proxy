import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { analyzeRouter } from './routes/analyze.route';
import { errorMiddleware } from './middlewares/error.middleware';
import { logger } from './utils/logger';

dotenv.config();

const uploadsDir = path.join(process.cwd(), 'uploads');
const logsDir = path.join(process.cwd(), 'logs');

[uploadsDir, logsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Klasör oluşturuldu: ${dir}`);
  }
});

const app: Application = express();
const PORT = process.env.PORT || 3000;
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'node-api',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', analyzeRouter);

// Error handling
app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.listen(PORT, () => {
  logger.info(`🚀 Node.js API Server running on port ${PORT}`);
  logger.info(`📡 Python AI Service URL: ${PYTHON_SERVICE_URL}`);
});

export default app;

