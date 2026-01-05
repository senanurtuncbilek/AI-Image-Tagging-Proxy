import { Router, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyToken } from "../middlewares/auth.middleware";

dotenv.config();

const router = Router();
const authService = new AuthService();

const JWT_SECRET = process.env.JWT_SECRET || "12345www67890";

// ============================================
// 1. LOGIN - TOKEN'I COOKIE'YE KAYDET
// ============================================
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Kullanıcı adı ve şifre gereklidir.",
      });
    }

    const user = await authService.validateUser(username, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Kullanıcı adı veya şifre hatalı.",
      });
    }

    // Token üret
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ COOKIE'YE KAYDET (httpOnly)
    res.cookie("token", token, {
      httpOnly: true, // JavaScript erişemez (XSS koruması)
      secure: process.env.NODE_ENV === "production", // Production'da HTTPS zorunlu
      sameSite: "strict", // CSRF koruması
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün (milisaniye cinsinden)
      domain: "localhost",
    });

    console.log("✅ Token cookie'ye kaydedildi");

    // ✅ YANIT: Token cookie'de, body'de sadece success
    return res.status(200).json({
      success: true,
      message: "Giriş başarılı!",
      // token YOK! Cookie'de gitti
    });
  } catch (error) {
    console.error("Giriş Hatası:", error);
    return res.status(500).json({
      success: false,
      message: "Sunucu hatası oluştu.",
    });
  }
});

// ============================================
// 2. GET /me - COOKIE'DEN TOKEN AL
// ============================================
router.get("/me", verifyToken, async (req: Request, res: Response) => {
  try {
    console.log("✅ /me route çağrıldı");

    const userId = (req as any).user?.userId || (req as any).user?.id;

    console.log("🔍 Token'dan gelen userId:", userId);

    if (!userId) {
      console.log("❌ userId bulunamadı!");
      return res.status(401).json({
        success: false,
        message: "Token geçersiz",
      });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    console.log("🔍 Bulunan user:", user ? user.username : "YOK");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    console.log("✅ /me yanıtı gönderiliyor:", user.username);
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error("❌ GetMe Hatası:", error);
    return res.status(500).json({
      success: false,
      message: "Sunucu hatası oluştu.",
    });
  }
});

// ============================================
// 3. LOGOUT - COOKIE'Yİ SİL
// ============================================
router.post("/logout", (req: Request, res: Response) => {
  console.log("👋 Logout - Cookie siliniyor");

  res.clearCookie("token");

  return res.status(200).json({
    success: true,
    message: "Çıkış başarılı",
  });
});

export { router as authRouter };
