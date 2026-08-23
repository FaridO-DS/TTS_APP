import 'dotenv/config';

// 1. Validation de sécurité : Empêche le serveur de démarrer à l'aveugle si des clés manquent
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'ARCJET_KEY'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`CRITICAL CONFIGURATION ERROR: ${varName} is missing in your .env file!`);
  }
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  // On s'assure que le PORT est un nombre exploitable par Express, avec une valeur par défaut
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  // Valeur de repli locale pour éviter les bugs de redirection d'authentification CORS
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  ARCJET_KEY: process.env.ARCJET_KEY,
  ARCJET_ENV: process.env.ARCJET_ENV || process.env.NODE_ENV || 'development',
  FASTAPI_URL : process.env.FASTAPI_URL || 'http://localhost:8000',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};
