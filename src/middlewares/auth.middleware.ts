import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Yetkisiz erişim: Token eksik!' });

    jwt.verify(token, process.env.JWT_SECRET || '12345www67890', (err: any, user: any) => {
        if (err) return res.status(403).json({ message: 'Geçersiz veya süresi dolmuş token!' });
        (req as any).user = user; // token geçerliyse user'ı ekle
        next();
    });
};