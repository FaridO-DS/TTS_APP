import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { useTtsStore } from "./store/useTtsStore";
import { Toaster } from "react-hot-toast";

// Composants
import Form from "./components/Form";
import TtsHistoryList from "./components/ttsHistoryList"; 
import Login from "./pages/LoginPage"; 
import Signup from "./pages/SignupPage"; 
import AudioPlayer from "./components/audioPlayer"; // 👈 Votre nouveau lecteur stylisé
import "./index.css";

export default function App() {
  const { authUser, isCheckingAuth, checkAuth, logout } = useAuthStore();

  const { 
    audioUrl, 
    isGenerating, 
    generateSpeech, 
    fetchHistory, 
    history, 
    isLoadingHistory 
  } = useTtsStore();

  const [text, setText] = useState("");
  const [language, setLanguage] = useState("a");

  useEffect(() => {
    checkAuth();
  }, []); 

  useEffect(() => {
    if (authUser) {
      fetchHistory();
    }
  }, [authUser]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    generateSpeech(text, language);
  };

  if (isCheckingAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium tracking-wide">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased">
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* Route principale de l'application TTS (Protégée) */}
        <Route
          path="/"
          element={
            authUser ? (
              <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col flex-grow mb-24"> 
                {/* 💡 Note : Ajout d'une marge basse 'mb-24' pour que la barre de lecture flottante ne cache pas le bas de l'historique */}
                
                {/* BARRE DE NAVIGATION / EN-TÊTE ACCUEIL */}
                <header className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
                      Speechy
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                      Enter text and instantly generate audio.
                    </p>
                  </div>
                  
                  {/* Bouton de déconnexion */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">
                      Happy to see you again !, <strong className="text-slate-200">{authUser.fullName || "Utilisateur"}</strong>
                    </span>
                    <button 
                      onClick={logout}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-lg text-sm font-medium border border-slate-700/50 transition-colors"
                    >
                      Log out
                    </button>
                  </div>
                </header>

                {/* CONTENU PRINCIPAL */}
                <main className="flex-grow space-y-8">
                  {/* Section du Formulaire */}
                  <div className="bg-slate-800/30 border border-slate-700/40 p-6 rounded-2xl shadow-xl backdrop-blur-md">
                    <Form
                      text={text}
                      setText={setText}
                      language={language}
                      setLanguage={setLanguage}
                      onSubmit={handleSubmit}
                      isLoading={isGenerating}
                    />
                  </div>

                  {/* Bouton de téléchargement rapide si un audio vient d'être généré */}
                  {audioUrl && (
                    <div className="flex items-center justify-end animate-fade-in">
                      <a 
                        href={audioUrl} 
                        target="_blank"
                        rel="noreferrer"
                        download="speech.mp3" 
                        className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-900 rounded-lg font-semibold text-sm transition-all shadow-md shadow-cyan-500/10 flex items-center gap-2"
                      >
                        Download last audio (.mp3)
                      </a>
                    </div>
                  )}

                  {/* Affichage de l'historique utilisateur */}
                  <TtsHistoryList history={history} isLoading={isLoadingHistory} />
                </main>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Routes publiques */}
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* LECTEUR AUDIO GLOBAL FLOTTANT */}
      {/* Il écoute l'état global Zustand. Dès que 'audioUrl' est rempli, il apparaît magiquement en bas de l'écran */}
      <AudioPlayer />
    </div>
  );
}
