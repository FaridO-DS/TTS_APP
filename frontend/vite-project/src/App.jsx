import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { useTtsStore } from "./store/useTtsStore";
import { Toaster } from "react-hot-toast";

// Composants
import Form from "./components/Form";
import HistoryList from "./components/HistoryList"; 
import Login from "./pages/LoginPage"; 
import Signup from "./pages/SignupPage"; 
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
              <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col flex-grow">
                {/* BARRE DE NAVIGATION / EN-TÊTE ACCUEIL */}
                <header className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
                      Speechy
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                      Saisissez un texte et générez immédiatement un audio vocal.
                    </p>
                  </div>
                  
                  {/* Bouton de déconnexion stylisé avec vos classes ou Tailwind */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">
                      Ravi de vous revoir, <strong className="text-slate-200">{authUser.fullName || "Utilisateur"}</strong>
                    </span>
                    <button 
                      onClick={logout}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-lg text-sm font-medium border border-slate-700/50 transition-colors"
                    >
                      Déconnexion
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

                  {/* Lecteur Audio Stylisé */}
                  {audioUrl && (
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-xl gap-4 shadow-lg animate-fade-in">
                      <audio controls src={audioUrl} className="w-full sm:max-w-md accent-cyan-500" autoPlay />
                      <a 
                        href={audioUrl} 
                        download="speech.wav" 
                        className="w-full sm:w-auto text-center px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-900 rounded-lg font-semibold text-sm transition-all shadow-md shadow-cyan-500/10"
                      >
                        Télécharger le fichier audio
                      </a>
                    </div>
                  )}

                  {/* Affichage de l'historique utilisateur */}
                  <HistoryList history={history} isLoading={isLoadingHistory} />
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
    </div>
  );
}

