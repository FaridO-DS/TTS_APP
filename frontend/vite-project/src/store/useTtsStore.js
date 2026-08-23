import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useTtsStore = create((set, get) => ({
  audioUrl: null, // Contiendra désormais l'URL permanente Cloudinary (ou l'URL locale en fallback)
  history: [],
  isGenerating: false,
  isLoadingHistory: false,
  
  // Action pour générer la voix à partir du texte ET l'envoyer sur Cloudinary
  generateSpeech: async (text, language) => {
    set({ isGenerating: true });
    
    const currentAudioUrl = get().audioUrl;
    // On ne révoque l'URL que si c'était une URL locale "blob:"
    if (currentAudioUrl && currentAudioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(currentAudioUrl);
    }

    try {
      // 1. Récupération du flux audio binaire (MPEG/MP3) depuis votre API TTS
      const res = await axiosInstance.post(
        "/api/tts", 
        { text, language }, 
        { responseType: "blob" } 
      );

      const audioBlob = res.data;

      // 2. Récupération des identifiants et de la signature Cloudinary depuis votre backend
      // Créez cette route côté backend pour générer la signature
      const cryptoRes = await axiosInstance.post("/api/cloudinary-signature");
      const { signature, timestamp, apiKey, cloudName, folder } = cryptoRes.data;

      // 3. Préparation du FormData pour Cloudinary
      const formData = new FormData();
      // On nomme le fichier avec l'extension .mp3 ou .mpeg
      formData.append("file", audioBlob, "audio.mp3");
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder || "audio_tts");

      // 4. Envoi direct du fichier à l'API Cloudinary (sans passer par votre serveur)
      const cloudinaryUrl = `https://cloudinary.com{cloudName}/video/upload`;
      
      // Utilisation d'un fetch standard ou axios sans les headers globaux de votre API si nécessaire
      const cloudRes = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      if (!cloudRes.ok) {
        throw new Error("Erreur lors du téléversement vers Cloudinary");
      }

      const cloudData = await cloudRes.json();
      const permanentAudioUrl = cloudData.secure_url; // L'URL https permanente de Cloudinary

      // 5. [Optionnel mais recommandé] Enregistrer cette URL Cloudinary dans votre historique backend
      // Permet de lier l'URL à l'utilisateur actuel en Base de Données
      await axiosInstance.post("/api/tts/save-history", {
        text,
        language,
        audioUrl: permanentAudioUrl
      });

      // 6. Mise à jour de l'état global avec l'URL Cloudinary
      set({ audioUrl: permanentAudioUrl });
      toast.success("Voice generated and saved successfully!");

      // Rafraîchissement automatique de l'historique
      await get().fetchHistory();
    } catch (error) {
      console.error("TTS Generation/Upload Error:", error);
      
      if (error.response?.data instanceof Blob) {
        const textError = await error.response.data.text();
        try {
          const jsonError = JSON.parse(textError);
          toast.error(jsonError.message || "Failed to generate voice.");
        } catch {
          toast.error("Failed to generate voice.");
        }
      } else {
        toast.error(error.message || "Failed to generate voice.");
      }
    } finally {
      set({ isGenerating: false });
    }
  },

  // Action pour charger l'historique de l'utilisateur connecté
  fetchHistory: async () => {
    set({ isLoadingHistory: true });
    try {
      const res = await axiosInstance.get("/api/tts/history");
      const historyData = res.data.success ? res.data.history : res.data;
      set({ history: Array.isArray(historyData) ? historyData : [] });
    } catch (error) {
      console.error("Fetch History Error:", error);
      toast.error("Could not load history.");
    } finally {
      set({ isLoadingHistory: false });
    }
  },

  // Action pour supprimer un audio de l'historique et de Cloudinary
  deleteHistoryItem: async (id) => {
    try {
      const res = await axiosInstance.delete(`/api/tts/${id}`);

      if (res.data.success) {
        toast.success("Audio deleted successfully!");
        
        // Mise à jour instantanée de l'état de l'historique côté client sans recharger toute l'API
        const updatedHistory = get().history.filter((item) => item._id !== id);
        set({ history: updatedHistory });

        // Si l'audio en train d'être écouté est celui qu'on supprime, on vide le lecteur
        const currentAudioUrl = get().audioUrl;
        // Si l'URL de l'historique supprimé correspond à l'audio sélectionné
        const deletedItem = get().history.find((item) => item._id === id);
        if (deletedItem && currentAudioUrl === deletedItem.audioUrl) {
          set({ audioUrl: null });
        }
      } else {
        throw new Error(res.data.message || "Failed to delete.");
      }
    } catch (error) {
      console.error("Delete History Error:", error);
      const errorMessage = error.response?.data?.message || "Could not delete this item.";
      toast.error(errorMessage);
    }
  },

  // Nettoyer l'audio manuellement
  clearAudio: () => {
    const currentAudioUrl = get().audioUrl;
    if (currentAudioUrl && currentAudioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(currentAudioUrl);
    }
    set({ audioUrl: null });
  }
}));
