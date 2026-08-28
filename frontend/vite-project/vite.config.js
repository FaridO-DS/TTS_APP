import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // ou plugin-react-swc

export default defineConfig({
  plugins: [react()],
  // 🟢 AJOUTEZ CE BLOC DE CONFIGURATION BUILD :
  build: {
    cssMinify: false // Force Vite à utiliser un minificateur CSS plus tolérant
  }
});

