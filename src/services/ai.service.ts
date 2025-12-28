import axios, { AxiosError } from 'axios';
import { logger } from '../utils/logger';
import FormData from 'form-data'; 
import fs from 'fs'; 

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';

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
  
  private static readonly INTERNAL_TOKEN = '1234567890987654321';

  /**
   * Python AI servisine resim analizi için istek gönderir
   */
  static async analyzeImage(imagePath: string): Promise<AnalysisResponse> {
    try {
      // Python 'request.files['image']' beklediği için FormData kullanmalıyız
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath));

      logger.info('Sending analysis request to Python service with Internal Token', { imagePath });

      const response = await axios.post<AnalysisResponse>(
        `${PYTHON_SERVICE_URL}/process`,
        formData,
        {
          headers: {
            ...formData.getHeaders(), 
            'Authorization': `Bearer ${this.INTERNAL_TOKEN}`
          },
          timeout: 30000 
        }
      );

      logger.info('Received analysis response from Python', {
        success: response.data.success
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<AnalysisResponse>;
        logger.error('Python service communication error', {
          status: axiosError.response?.status,
          message: axiosError.message
        });
        
        return {
          success: false,
          error: axiosError.response?.data?.error || 'Python servisi ile iletişim kurulamadı.'
        };
      }

      logger.error('Unexpected error in AI service', { error });
      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }
}