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
      // 🟢 CORRECTION : On retire { responseType: "blob" } car le serveur renvoie du JSON maintenant !
      const res = await axiosInstance.post("/api/tts", { text, language });

      // L'API Express renvoie : { success: true, audioUrl: "...", message: "..." }
      if (res.data && res.data.success) {
        // On stocke directement l'URL Cloudinary persistante
        set({ audioUrl: res.data.audioUrl });
        toast.success("Voice generated successfully!");

        // 🔄 L'historique se rafraîchit maintenant automatiquement sans encombre !
        await get().fetchHistory();
      } else {
        throw new Error(res.data?.message || "Failed to generate voice.");
      }
    } catch (error) {
      console.error("TTS Generation Error:", error);
      
      // Gestion propre des erreurs au format JSON
      const errorMessage = error.response?.data?.message || error.message || "Failed to generate voice.";
      toast.error(errorMessage);
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
