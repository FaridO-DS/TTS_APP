import { useEffect } from "react";
import { useTtsStore } from "../store/useTtsStore";
import { Play, Trash2, Clock, Calendar, Globe, Headphones } from "lucide-react";

export default function TtsHistoryList() {
  const { history, fetchHistory, isLoadingHistory, deleteHistoryItem, audioUrl, generateSpeech } = useTtsStore();

  // Chargement automatique de l'historique au montage du composant
  useEffect(() => {
    fetchHistory();
  }, []);

  // Utilitaire pour transformer les secondes (ex: 75) en format MM:SS (ex: 01:15)
  const formatDuration = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Utilitaire pour formater joliment la date createdAt de MongoDB
  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Dictionnaire pour afficher les langues de façon lisible
  const languageNames = {
    a: "English (US)",
    b: "English (UK)",
    e: "Spanish",
    f: "French",
    h: "Hindi",
    i: "Italian",
    p: "Portuguese",
  };

  if (isLoadingHistory) {
    return (
      <div className="flex justify-center items-center py-12 text-slate-500 gap-2">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Loading your history...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 bg-slate border border-dashed border-slate-200 rounded-2xl">
        <Headphones className="mx-auto mb-3 text-slate-300" size={32} />
        <p>No audio generated yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-4">
      <h2 className="text-xl font-bold text-indigo-700 flex items-center gap-2 mb-6">
        <Clock size={22} className="text-indigo-700" />
        Generation history
      </h2>

      <div className="grid gap-3">
        {history.map((item) => {
          const isCurrentPlaying = audioUrl === item.audioUrl;

          return (
            <div 
              key={item._id}
              className={`p-4 bg-slate-600 border rounded-xl shadow-sm transition flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md ${
                isCurrentPlaying ? "border-indigo-500 bg-indigo-50/30" : "border-slate-100"
              }`}
            >
              {/* Infos Texte & Langue */}
              <div className="flex-1 min-w-0">
                <p className="text-slate-300 font-medium text-sm md:text-base line-clamp-2 mb-2">
                  "{item.text}"
                </p>
                
                {/* Métadonnées (Badges) */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md text-slate-600 font-medium">
                    <Globe size={12} />
                    {languageNames[item.language] || item.language}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(item.duration_seconds)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>

              {/* Actions : Écouter / Supprimer */}
              <div className="flex items-center justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                {/* Bouton Écouter */}
                <button
                  onClick={() => useTtsStore.setState({ audioUrl: item.audioUrl })}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    isCurrentPlaying
                      ? "bg-indigo-700 text-white shadow-indigo-200"
                      : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  }`}
                >
                  <Play size={16} fill={isCurrentPlaying ? "currentColor" : "none"} />
                  {isCurrentPlaying ? "Listening..." : "Listen"}
                </button>

                {/* Bouton Supprimer (Poubelle) */}
                <button
                  onClick={() => {
                    if (confirm("Do you really want to delete this audio from your history and the cloud?")) {
                      deleteHistoryItem(item._id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Permanently delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
