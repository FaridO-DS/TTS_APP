import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import { ENV } from "./env.js";

const aj = arcjet({
  key: ENV.ARCJET_KEY,
  // Définition des règles de sécurité globales de l'API
  rules: [
    // 1. Shield WAF : Protège contre les attaques courantes (injections SQL, XSS, etc.)
    shield({ mode: "LIVE" }),
    
    // 2. Détection de Bots : Bloque les scrapers et robots malveillants
    detectBot({
      mode: "LIVE", 
      // Bloque TOUS les bots par défaut, sauf les moteurs de recherche pour le SEO
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc.
      ],
    }),
    
    // 3. Rate Limiting (Fenêtre glissante) : Limite les abus sur l'API TTS
    slidingWindow({
        mode: "LIVE", // Correction : 'mode' et non 'model'
        max: 100,     // Maximum de 100 requêtes autorisées
        interval: 60, // Sur une fenêtre glissante de 60 secondes
      }),
  ],
});

export default aj;
