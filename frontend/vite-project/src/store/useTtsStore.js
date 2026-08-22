import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useTtsStore = create((set, get) => ({
  audioUrl: null,
  history: [],
  isGenerating: false,
  isLoadingHistory: false,

  // Action pour générer la voix à partir du texte
  generateSpeech: async (text, language) => {
    set({ isGenerating: true });
    
    // Nettoyage préventif de l'ancien audio pour éviter les fuites mémoire
    const currentAudioUrl = get().audioUrl;
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
    }

    try {
      const res = await axiosInstance.post(
        "/api/tts", 
        { text, language }, 
        { responseType: "blob" } // Obligatoire pour le flux audio binaire
      );

      // Création de l'URL locale temporaire
      const blobUrl = URL.createObjectURL(res.data);
      set({ audioUrl: blobUrl });
      toast.success("Voice generated successfully!");

      // Rafraîchissement automatique de l'historique
      await get().fetchHistory();
    } catch (error) {
      console.error("TTS Generation Error:", error);
      
      // Extraction du vrai message d'erreur caché dans le Blob si disponible
      if (error.response?.data instanceof Blob) {
        const textError = await error.response.data.text();
        try {
          const jsonError = JSON.parse(textError);
          toast.error(jsonError.message || "Failed to generate voice.");
        } catch {
          toast.error("Failed to generate voice.");
        }
      } else {
        toast.error("Failed to generate voice.");
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
      // S'adapte si votre API renvoie directement le tableau ou un objet { success, history }
      const historyData = res.data.success ? res.data.history : res.data;
      set({ history: Array.isArray(historyData) ? historyData : [] });
    } catch (error) {
      console.error("Fetch History Error:", error);
      toast.error("Could not load history.");
    } finally {
      set({ isLoadingHistory: false });
    }
  },

  // Nettoyer l'audio manuellement
  clearAudio: () => {
    const currentAudioUrl = get().audioUrl;
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
    }
    set({ audioUrl: null });
  }
}));
