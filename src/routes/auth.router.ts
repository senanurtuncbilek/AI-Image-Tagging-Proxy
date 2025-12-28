import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();

const router = Router();
const authService = new AuthService();


const JWT_SECRET = process.env.JWT_SECRET || '12345www67890' ;

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        // Eksik veri kontrolü
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Kullanıcı adı ve şifre gereklidir." 
            });
        }

        // Doğrulama
        const user = await authService.validateUser(username, password);

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Kullanıcı adı veya şifre hatalı." 
            });
        }

        // Başarılıysa token üret
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.status(200).json({
            success: true,
            message: "Giriş başarılı!",
            token: token,
            user: { username: user.username }
        });

    } catch (error) {
        console.error("Giriş Hatası:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Sunucu hatası oluştu." 
        });
    }
});


export { router as authRouter };