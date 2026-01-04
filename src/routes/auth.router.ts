import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { User } from '../models/User';  // ✅ DOĞRU IMPORT
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { verifyToken } from '../middlewares/auth.middleware';

dotenv.config();

const router = Router();
const authService = new AuthService();

const JWT_SECRET = process.env.JWT_SECRET || '12345www67890';

// ============================================
// 1. LOGIN - SADECE TOKEN DÖN
// ============================================
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Kullanıcı adı ve şifre gereklidir." 
            });
        }

        const user = await authService.validateUser(username, password);

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Kullanıcı adı veya şifre hatalı." 
            });
        }

        // Token üret
        const token = jwt.sign(
            { 
                userId: user.id,
                username: user.username 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // SADECE TOKEN DÖN
        return res.status(200).json({
            success: true,
            message: "Giriş başarılı!",
            token: token
        });

    } catch (error) {
        console.error("Giriş Hatası:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Sunucu hatası oluştu." 
        });
    }
});

// ============================================
// 2. GET /me - KULLANICI BİLGİLERİNİ AL
// ============================================
router.get('/me', verifyToken, async (req: Request, res: Response) => {
    try {
        console.log(' /me route çağrıldı');
        
        // verifyToken middleware'den gelen user bilgisi
        const userId = (req as any).user?.userId || (req as any).user?.id;
        
        console.log('Token\'dan gelen userId:', userId);
        
        if (!userId) {
            console.log('userId bulunamadı!');
            return res.status(401).json({
                success: false,
                message: 'Token geçersiz'
            });
        }
        
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });
        
        console.log(' Bulunan user:', user ? user.username : 'YOK');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }
        
        // Başarılı yanıt
        console.log('/me yanıtı gönderiliyor:', user.username);
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                isActive: user.isActive,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt
            }
        });
        
    } catch (error) {
        console.error('GetMe Hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası oluştu.'
        });
    }
});

export { router as authRouter };