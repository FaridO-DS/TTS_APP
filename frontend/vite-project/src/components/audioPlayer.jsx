import { useRef, useState, useEffect } from "react";
import { useTtsStore } from "../store/useTtsStore";
import { Play, Pause, Volume2, X } from "lucide-react";

export default function AudioPlayer() {
  const { audioUrl, clearAudio } = useTtsStore();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Lecture auto bloquée :", err));
    } else {
      setIsPlaying(false);
    }
  }, [audioUrl]);

  if (!audioUrl) return null;

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration || 1;
    setProgress((current / duration) * 100);
  };

  const handleSeek = (e) => {
    const newProgress = parseFloat(e.target.value);
    const duration = audioRef.current.duration || 0;
    audioRef.current.currentTime = (newProgress / 100) * duration;
    setProgress(newProgress);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl bg-slate-800/80 border border-slate-700/50 backdrop-blur-lg text-slate-100 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-fade-in-up">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Bouton Play/Pause aux couleurs de Speechy (Cyan) */}
      <button
        onClick={togglePlay}
        className="p-3 bg-cyan-500 hover:bg-cyan-400 active:scale-95 transition-all rounded-full text-slate-950 shadow-lg shadow-cyan-500/20"
      >
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
      </button>

      {/* Barre de Progression en harmonie avec le thème */}
      <div className="flex-1 flex flex-col gap-1">
        <span className="text-xs text-slate-400 font-medium truncate tracking-wide">Lecture en cours...</span>
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />
      </div>

      <Volume2 size={18} className="text-slate-500 hidden sm:block" />

      {/* Bouton Fermer */}
      <button
        onClick={clearAudio}
        className="p-1.5 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}
