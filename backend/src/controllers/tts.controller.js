import axios from 'axios';
import { ENV } from '../lib/env.js';
import History from '../models/History.js'; 
import cloudinary from '../lib/cloudinary.js';
import User from '../models/User.js';

export const tts = async (req, res) => {
    const { text, language } = req.body;
    const userId = req.user._id;

    // 1. Validation des données d'entrée
    if (!text) {
        return res.status(400).json({ success: false, message: 'Text is required.' });
    }

    try {
        // 1. Récupérer l'utilisateur à jour depuis la base de données
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // 2. 🔴 VÉRIFICATION DU COMPTEUR PERMANENT (Insensible aux suppressions d'historique)
        if (user.generationsCount >= 3) {
            return res.status(403).json({ 
                success: false, 
                message: "Free plan limit reached (3 generations). Upgrade to the Premium plan for unlimited access and custom voices !" 
            });
        
        }

        // 3. Appel à FastAPI en demandant un flux binaire (arraybuffer)
        const fastapiResponse = await axios.post(`${ENV.FASTAPI_URL}/tts`, 
            { 
                text, 
                language: language || 'a' 
            }, 
            { 
                responseType: 'arraybuffer' 
            }
        );

        // Conversion des données reçues en Buffer Node.js
        const audioBuffer = Buffer.from(fastapiResponse.data);

        // 4. Téléversement vers Cloudinary via un Stream
        const uploadToCloudinary = (buffer) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'video', // Obligatoire pour les fichiers audio/vidéo
                        folder: 'audio_tts',    // Nom du dossier sur votre espace Cloudinary
                        format: 'mp3',          // Force la conversion/extension en MP3 (MPEG) pour économiser l'espace
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                uploadStream.end(buffer);
            });
        };

        // Exécution du téléversement et récupération du résultat
        const cloudinaryResult = await uploadToCloudinary(audioBuffer);
        const permanentAudioUrl = cloudinaryResult.secure_url; // L'URL HTTPS officielle hébergée

        // 5. Sauvegarde dans MongoDB avec la vraie URL Cloudinary
        const newHistoryItem = await History.create({
            userId,
            text,
            language: language || 'default',
            audioUrl: permanentAudioUrl, // L'URL persistante est maintenant stockée ici !
            duration_seconds: cloudinaryResult.duration ? Math.round(cloudinaryResult.duration) : 0, 
        });

        // 6. Réponse au format JSON pour le Frontend
        // Puisque Cloudinary héberge l'audio, le frontend n'a plus besoin de recevoir un Blob binaire brut.
        user.generationsCount +=1;
        await user.save();
        
        return res.status(200).json({
            success: true,
            message: 'Audio successfully generated and hosted.',
            audioUrl: permanentAudioUrl,
            historyItem: newHistoryItem
        });

    } catch (error) {
        if (error.response) {
            console.error("Détails de l'erreur renvoyée par FastAPI:", error.response.status, error.response.data);
        } else {
            console.error('Erreur interne Express / Cloudinary :', error.message);
        }
        return res.status(500).json({ 
            success: false, 
            message: 'Erreur technique lors de la génération ou de l\'hébergement de la voix.' 
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

export const deleteTts = async (req, res) => {
    const { id } = req.params; // L'ID du document de l'historique dans MongoDB

    try {
        // 1. Trouver l'élément dans l'historique MongoDB
        const historyItem = await History.findOne({ _id: id, userId: req.user._id });

        if (!historyItem) {
            return res.status(404).json({ 
                success: false, 
                message: "Élément introuvable ou vous n'avez pas l'autorisation de le supprimer." 
            });
        }

        // 2. Extraire le Public ID de Cloudinary depuis l'URL stockée
        // Exemple d'URL : https://cloudinary.com
        if (historyItem.audioUrl && historyItem.audioUrl.includes("cloudinary.com")) {
            try {
                // Cette regex découpe l'URL pour extraire 'audio_tts/un_id_unique' (sans l'extension .mp3)
                const urlParts = historyItem.audioUrl.split('/');
                const filenameWithExtension = urlParts.pop(); // ex: un_id_unique.mp3
                const folderName = urlParts.pop(); // ex: audio_tts
                const publicId = `${folderName}/${filenameWithExtension.split('.')[0]}`; // ex: audio_tts/un_id_unique

                // 3. Supprimer le fichier de Cloudinary
                await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
            } catch (cloudinaryError) {
                // On log l'erreur mais on ne bloque pas la suppression de la DB si Cloudinary échoue
                console.error("Erreur lors de la suppression Cloudinary :", cloudinaryError.message);
            }
        }

        // 4. Supprimer le document de la base de données MongoDB
        await History.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Audio et historique supprimés avec succès."
        });

    } catch (error) {
        console.error("Erreur lors de la suppression complète :", error.message);
        return res.status(500).json({
            success: false,
            message: "Erreur technique lors de la suppression."
        });
    }
};
