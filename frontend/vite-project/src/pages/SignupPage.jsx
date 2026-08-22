import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MessageCircleIcon, LockIcon, MailIcon, UserIcon, Loader } from "lucide-react";
import { Link } from "react-router-dom";

export default function SignupPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) return;
    signup(formData);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100">
      <div className="w-full max-w-5xl bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md flex flex-col md:flex-row">
        
        {/* COLONNE GAUCHE - FORMULAIRE */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center md:border-r border-slate-700/30">
          <div className="w-full max-w-md mx-auto">
            {/* EN-TÊTE */}
            <div className="text-center mb-8">
              <MessageCircleIcon className="w-12 h-12 mx-auto text-cyan-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Create Account</h2>
              <p className="text-slate-400 text-sm">Sign up for a new account</p>
            </div>

            {/* FORMULAIRE */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="auth-input-label">Full Name</label>
                <div className="relative">
                  <UserIcon className="auth-input-icon" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="input"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="auth-input-label">Email</label>
                <div className="relative">
                  <MailIcon className="auth-input-icon" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    placeholder="johndoe@gmail.com"
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

              <button className="auth-btn flex items-center justify-center" type="submit" disabled={isSigningUp}>
                {isSigningUp ? (
                  <Loader className="w-5 h-5 animate-spin mx-auto text-white" />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="auth-link">
                Already have an account? Login
              </Link>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE - ILLUSTRATION */}
        <div className="hidden md:w-1/2 md:flex flex-col items-center justify-center p-8 bg-slate-800/20">
          <div className="text-center max-w-sm">
            <div className="w-full h-48 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 mb-6">
              <span className="text-cyan-400 font-semibold text-lg">VocalEase Layout</span>
            </div>
            <h3 className="text-xl font-medium text-cyan-400">Start Your Journey Today</h3>
            <p className="text-slate-400 text-sm mt-2">
              Convert your written content into natural-sounding speech instantly.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <span className="auth-badge">Free</span>
              <span className="auth-badge">Easy Setup</span>
              <span className="auth-badge">Private</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
