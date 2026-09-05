import dotenv from 'dotenv';
import User from '../models/User.js';
dotenv.config();

export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const inputEmail = String(email).trim().toLowerCase();
    const inputPassword = String(password).trim();

    const expectedEmail = String(process.env.ADMIN_EMAIL || 'daavakjaganathan10@gmail.com').trim().toLowerCase();
    const expectedPassword = String(process.env.ADMIN_PASSWORD || 'daavak@1912').trim();

    // 1. Check MongoDB database for registered admin user
    try {
      const dbUser = await User.findOne({ email: inputEmail });
      if (dbUser && String(dbUser.password).trim() === inputPassword) {
        return res.json({
          success: true,
          message: 'Admin authentication successful',
          data: {
            token: 'vcms-admin-session-token-secret-2026',
            user: {
              name: dbUser.name || 'Festival Organizer Admin',
              email: dbUser.email,
              role: dbUser.role || 'admin',
            },
          },
        });
      }
    } catch (dbErr) {
      console.warn('DB Admin User lookup warning:', dbErr.message);
    }

    // 2. Direct check against configured credentials / env variables
    if (inputEmail === expectedEmail && inputPassword === expectedPassword) {
      return res.json({
        success: true,
        message: 'Admin authentication successful',
        data: {
          token: 'vcms-admin-session-token-secret-2026',
          user: {
            name: 'Festival Organizer Admin',
            email: expectedEmail,
            role: 'admin',
          },
        },
      });
    }

    console.warn(`[AUTH FAIL] Failed login attempt for email: "${inputEmail}"`);
    return res.status(401).json({
      success: false,
      message: 'Invalid Admin email or password.',
    });
  } catch (err) {
    next(err);
  }
};
