import axios from 'axios';
import { ENV } from '../lib/env.js';
import History from '../models/History.js'; 

export const tts = async (req, res) => {
    const { text, language } = req.body;

    // 1. Validation des données d'entrée
    if (!text) {
        return res.status(400).json({ success: false, message: 'Le texte est requis.' });
    }

    try {
        // 2. Appel à FastAPI en demandant un flux binaire (arraybuffer)
        const fastapiResponse = await axios.post(`${ENV.FASTAPI_URL}/tts`, 
            { 
                text, 
                language: language || 'a' 
            }, 
            { 
                responseType: 'arraybuffer' 
            }
        );

        // 3. Sauvegarde en arrière-plan dans MongoDB (Historique lié à l'utilisateur connecté)
        // req.user._id provient de ton middleware protectRoute
        await History.create({
            userId: req.user._id,
            text: text,
            language: language || 'default',
            
            audioUrl : "",
            createdAt: new Date(),
        });

        // 4. Configuration des en-têtes HTTP pour le fichier audio
        res.set({
            'Content-Type': 'audio/wav',
            'Content-Length': fastapiResponse.data.byteLength
        });

        // 5. Envoi sécurisé du binaire converti
        return res.send(Buffer.from(fastapiResponse.data));
        
         

    } catch (error) {
        if (error.response) {
        console.error("Détails de l'erreur renvoyée par FastAPI:", error.response.status, error.response.data);
        } else {
            console.error('Erreur interne Express :', error.message);
        }
        return res.status(500).json({ 
            success: false, 
            message: 'Erreur technique lors de la génération de la voix.' 
        });
    }
};

export const getHistory = async (req, res) => {
    try {
        // Récupère l'historique de l'utilisateur connecté, trié du plus récent au plus ancien
        const history = await History.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            history
        });
        
    } catch (error) {
        console.error("Erreur lors de la récupération de l'historique:", error.message);
        return res.status(500).json({
            success: false,
            message: "Impossible de récupérer l'historique."
        });
    }
};
