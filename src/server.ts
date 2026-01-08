import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { analyzeRouter } from "./routes/analyze.route";
import { errorMiddleware } from "./middlewares/error.middleware";
import { logger } from "./utils/logger";
import { sequelize } from "./database/config";
import { authRouter } from "./routes/auth.router";

dotenv.config();

const uploadsDir = path.join(process.cwd(), "uploads");
const logsDir = path.join(process.cwd(), "logs");

[uploadsDir, logsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Klasör oluşturuldu: ${dir}`);
  }
});

const app: Application = express();
const PORT = process.env.PORT || 3000;
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5000";


app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "node-api",
    timestamp: new Date().toISOString(),
  });
});


app.use("/api/auth", authRouter);  // Auth önce
app.use("/api", analyzeRouter);    // Diğer API'ler sonra

// Error handling
app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info("PostgreSQL bağlantısı başarılı.");

    await sequelize.sync({ alter: true });
    logger.info("Veritabanı tabloları güncellendi.");

    app.listen(PORT, () => {
      logger.info(`🚀 Node.js API Server running on port ${PORT}`);
      logger.info(`📡 Python AI Service URL: ${PYTHON_SERVICE_URL}`);
    });
  } catch (error) {
    logger.error("Sunucu başlatılamadı:", error);
    process.exit(1);
  }
};

startServer();

export default app;