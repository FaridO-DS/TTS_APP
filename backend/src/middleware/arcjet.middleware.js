import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
    try {
        // Demande une décision d'accès à Arcjet sur la requête entrante
        const decision = await aj.protect(req);

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ message: "Rate limit exceeded. Please try again later." });
            } 
            
            if (decision.reason.isBot()) {
                return res.status(403).json({ message: "Bot access denied." });
            } 
            
            return res.status(403).json({ message: "Access denied by security policy." });
        }

        // Détection et blocage des robots malveillants ou usurpés
        if (decision.results.some(isSpoofedBot)) {
            return res.status(403).json({
                message: "Access denied. Malicious spoofed bot activity detected."
            });
        }

        // Si tout est validé, on passe au middleware ou contrôleur suivant
        next();

    } catch (error) {
        // En cas de panne d'Arcjet (ex: problème de clé API), on laisse passer la requête 
        // pour ne pas bloquer vos utilisateurs légitimes en production (Fail-open)
        console.error("Arcjet protection Error:", error);
        next();
    } 
};
