/**
 * Authentication configuration
 * Centralizes all authentication-related settings
 */

export const AUTH_CONFIG = {
  JWT_EXPIRES_IN: "7d",
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  BCRYPT_SALT_ROUNDS: 12,
};
