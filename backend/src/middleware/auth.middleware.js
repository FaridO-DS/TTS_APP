import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (req, res, next) => {
    try {
        // 1. Correction : On récupère 'token' et non 'jwt'
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        // 2. Vérification et décodage du jeton
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }
        
        // 3. Correction : On utilise 'decoded.id' conformément au fichier utils.js
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Unauthorized - User not found" });
        }

        // 4. On injecte l'utilisateur dans la requête pour les contrôleurs suivants
        req.user = user;
        next();

    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
    }
};
