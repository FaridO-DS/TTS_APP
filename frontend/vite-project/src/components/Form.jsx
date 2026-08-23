export default function Form({ text, setText, language, setLanguage, onSubmit, isLoading }) {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-6 bg-[#0f172a]/50 rounded-xl border border-slate-800 shadow-xl">
      
      {/* Zone de texte */}
      <div className="flex flex-col gap-2">
        <label htmlFor="text-input" className="text-sm font-medium text-slate-300">
          Texte à convertir en audio
        </label>
        <textarea
          id="text-input"
          className="w-full min-h-[120px] p-4 rounded-lg bg-slate-900/80 text-white border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition-all"
          name="text"
          rows="4"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Écrivez ici le texte à synthétiser..."
        />
      </div>

      {/* Barre d'actions du bas */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 border-t border-slate-800/60">
        
        {/* Sélecteur de langue */}
        <div className="flex flex-col gap-2 w-full sm:w-64">
          <label htmlFor="language-select" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Langue
          </label>
          <select
            id="language-select"
            className="w-full p-2.5 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="a">Anglais américain</option>
            <option value="b">Britannique</option>
            <option value="e">Espagnol</option>
            <option value="f">Français</option>
            <option value="h">Hindi</option>
            <option value="i">Italien</option>
            <option value="p">Portugais brésilien</option>
          </select>
        </div>

        {/* Bouton de soumission */}
        <button 
          type="submit" 
          className="px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/10 active:scale-[0.98]" 
          disabled={isLoading || !text.trim()}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              <span>Conversion...</span>
            </div>
          ) : 'Convertir en audio'}
        </button>
      </div>

    </form>
  )
}
