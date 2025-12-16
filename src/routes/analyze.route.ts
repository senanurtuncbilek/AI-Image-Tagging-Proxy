import { Router, Request, Response, NextFunction } from 'express';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import { AIService } from '../services/ai.service';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

const router = Router();

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

/**
 * POST /api/analyze
 * Resim yükleme ve analiz endpoint'i
 */
router.post('/analyze', (req: MulterRequest, res: Response, next: NextFunction) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resim dosyası yüklenmedi. "image" field\'ını kullanın.'
      });
    }

    const startTime = Date.now();
    const imageId = path.parse(req.file.filename).name;
    const imagePath = req.file.path;
    const fileSize = req.file.size;

    logger.info('Image upload received', {
      imageId,
      filename: req.file.originalname,
      size: fileSize,
      mimetype: req.file.mimetype
    });

    try {
      // Python servisine analiz isteği gönder
      const analysisResult = await AIService.analyzeImage(imagePath);

      if (!analysisResult.success) {
        // Hata durumunda dosyayı sil
        fs.unlinkSync(imagePath);
        return res.status(500).json({
          success: false,
          message: analysisResult.error || 'Resim analizi başarısız oldu'
        });
      }

      const processingTime = Date.now() - startTime;

      // Başarılı yanıt
      const response = {
        success: true,
        image_id: imageId,
        filename: req.file.originalname,
        size_bytes: fileSize,
        uploaded_at: new Date().toISOString(),
        analysis: {
          object_counts: analysisResult.object_counts || {},
          keywords: analysisResult.keywords || [],
          total_objects: analysisResult.total_objects || 0,
          confidence: analysisResult.confidence || 0
        },
        processing_time_ms: processingTime,
        model_version: analysisResult.model_version || 'unknown'
      };

      logger.info('Analysis completed successfully', {
        imageId,
        totalObjects: response.analysis.total_objects,
        processingTime
      });

      res.json(response);
    } catch (error) {
      // Hata durumunda dosyayı temizle
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      logger.error('Error during analysis', { error, imageId });
      next(error);
    }
  });
});

export { router as analyzeRouter };



