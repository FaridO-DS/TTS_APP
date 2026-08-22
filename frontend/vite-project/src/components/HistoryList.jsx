import { PlayIcon, DownloadIcon, CalendarIcon, MessageSquareIcon } from "lucide-react";

export default function HistoryList({ history = [], isLoading }) {
  
  // 1. État de chargement (Squelettes fluides)
  if (isLoading) {
    return (
      <div className="mt-8 space-y-4 w-full max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold text-slate-300 animate-pulse">Chargement de l'historique...</h3>
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-20 bg-slate-800/40 rounded-xl border border-slate-700/50 animate-pulse" />
        ))}
      </div>
    );
  }

  // 2. État vide
  if (!history || history.length === 0) {
    return (
      <div className="mt-8 text-center p-8 border border-dashed border-slate-700 rounded-xl max-w-4xl mx-auto bg-slate-800/10">
        <MessageSquareIcon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
        <p className="text-slate-400 text-sm">Aucun historique de génération trouvé.</p>
        <p className="text-slate-500 text-xs mt-1">Saisissez un texte ci-dessus pour commencer.</p>
      </div>
    );
  }

  // 3. Rendu de la liste
  return (
    <div className="mt-8 w-full max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <span>Vos Générations Récentes</span>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-normal">
            {history.length}
          </span>
        </h3>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[450px] pr-2 custom-scrollbar">
        {history.map((item) => {
          // Formatage rapide de la date si disponible
          const formattedDate = item.createdAt 
            ? new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
            : "Récemment";

          return (
            <div 
              key={item._id || item.id} 
              className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl hover:border-slate-600/50 hover:bg-slate-800/50 transition-all group"
            >
              {/* Infos Texte & Date */}
              <div className="flex flex-col gap-1 max-w-[70%]">
                <p className="text-slate-200 text-sm font-medium line-clamp-2 leading-relaxed">
                  {item.text}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {formattedDate}
                  </span>
                  <span className="bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded uppercase text-[10px] tracking-wider font-semibold">
                    {item.voice || item.language || "Défaut"}
                  </span>
                </div>
              </div>

              {/* Actions Audio */}
              <div className="flex items-center gap-2">
                {/* Note : Si votre backend stocke l'audio sur Cloudinary/S3, utilisez item.audioUrl */}
                <a
                  href={item.audioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-cyan-500 hover:text-slate-900 transition-colors"
                  title="Écouter"
                >
                  <PlayIcon className="w-4 h-4 fill-current" />
                </a>
                
                <a
                  href={item.audioUrl}
                  download={`vocaleyase-${item._id || "audio"}.wav`}
                  className="p-2.5 rounded-lg bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
                  title="Télécharger"
                >
                  <DownloadIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
