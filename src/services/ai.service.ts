import axios, { AxiosError } from 'axios';
import { logger } from '../utils/logger';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';

export interface AnalysisRequest {
  image_path: string;
  options?: {
    confidence_threshold?: number;
    max_objects?: number;
  };
}

export interface AnalysisResponse {
  success: boolean;
  object_counts?: Record<string, number>;
  keywords?: string[];
  total_objects?: number;
  processing_time?: number;
  model_version?: string;
  confidence?: number;
  error?: string;
}

export class AIService {
  /**
   * Python AI servisine resim analizi için istek gönderir
   */
  static async analyzeImage(imagePath: string, options?: AnalysisRequest['options']): Promise<AnalysisResponse> {
    try {
      const requestData: AnalysisRequest = {
        image_path: imagePath,
        options: {
          confidence_threshold: options?.confidence_threshold || 0.5,
          max_objects: options?.max_objects || 50
        }
      };

      logger.info('Sending analysis request to Python service', {
        imagePath,
        options: requestData.options
      });

      const response = await axios.post<AnalysisResponse>(
        `${PYTHON_SERVICE_URL}/process`,
        requestData,
        {
          timeout: 30000 // 30 saniye timeout
        }
      );

      logger.info('Received analysis response', {
        success: response.data.success,
        totalObjects: response.data.total_objects
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<AnalysisResponse>;
        
        if (axiosError.response) {
          // Python servisi hata döndü
          logger.error('Python service returned error', {
            status: axiosError.response.status,
            data: axiosError.response.data
          });
          return {
            success: false,
            error: axiosError.response.data?.error || 'Python servisi hata döndü'
          };
        } else if (axiosError.request) {
          // İstek gönderildi ama cevap alınamadı
          logger.error('Python service is not reachable', {
            url: PYTHON_SERVICE_URL
          });
          return {
            success: false,
            error: 'Python AI servisi erişilemiyor. Servisin çalıştığından emin olun.'
          };
        }
      }

      logger.error('Unexpected error in AI service', { error });
      return {
        success: false,
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }
}



