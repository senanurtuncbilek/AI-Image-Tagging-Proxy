import bcrypt from "bcrypt";
import { User } from "../models/User";

export class AuthService {
  async register(username: string, password: string) {
    const hashedPossword = await bcrypt.hash(password, 10);
    return await User.create({
      username,
      password: hashedPossword,
      isActive: true,
    });
  }

  // Giriş kontrolü
  async validateUser(username: string, pass: string) {
    const user = await User.findOne({ where: { username } });
    
    if (user) {
        const isMatch = await bcrypt.compare(pass, user.password);
        
        if (isMatch) {
            user.lastLoginAt = new Date();
            await user.save();
            return user;
        }
    }
    return null;
}
}
