import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Yetkisiz erişim: Token eksik!' 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || '12345www67890', (err: any, decoded: any) => {
        if (err) {
            return res.status(403).json({ 
                success: false,
                message: 'Geçersiz veya süresi dolmuş token!' 
            });
        }
        
        // Token'daki bilgileri req'e ekle
        (req as any).user = {
            userId: decoded.userId || decoded.id,
            username: decoded.username
        };
        
        next();
    });
};