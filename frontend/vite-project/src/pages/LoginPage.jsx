import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MessageCircleIcon, LockIcon, MailIcon, Loader } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) return;
    login(formData);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100">
      <div className="w-full max-w-5xl bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md flex flex-col md:flex-row">
        
        {/* COLONNE GAUCHE - ILLUSTRATION */}
        <div className="hidden md:w-1/2 md:flex flex-col items-center justify-center p-8 bg-slate-800/20 md:border-r border-slate-700/30">
          <div className="text-center max-w-sm">
            <div className="w-full h-48 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 mb-6">
              <span className="text-cyan-400 font-semibold text-lg">Speechy</span>
            </div>
            <h3 className="text-xl font-medium text-cyan-400">Welcome Back</h3>
            <p className="text-slate-400 text-sm mt-2">
              Sign in to continue generating natural voices and access your history.
            </p>
          </div>
        </div>

        {/* COLONNE DROITE - FORMULAIRE */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            {/* EN-TÊTE */}
            <div className="text-center mb-8">
              <MessageCircleIcon className="w-12 h-12 mx-auto text-cyan-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Account Login</h2>
              <p className="text-slate-400 text-sm">Welcome back! Please enter your details</p>
            </div>

            {/* FORMULAIRE */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="auth-input-label">Email Address</label>
                <div className="relative">
                  <MailIcon className="auth-input-icon" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="auth-input-label">Password</label>
                <div className="relative">
                  <LockIcon className="auth-input-icon" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button className="auth-btn flex items-center justify-center" type="submit" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <Loader className="w-5 h-5 animate-spin mx-auto text-white" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/signup" className="auth-link">
                Don't have an account? Sign up
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
