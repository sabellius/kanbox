/**
 * Server and application configuration
 */

export default {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000"),

  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
};
