export default function Form({ text, setText, language, setLanguage, onSubmit, isLoading }) {
  return (
    <form onSubmit={onSubmit} className="tts-form">
      <label htmlFor="text-input" className="label-lg">
        Texte à convertir en audio
      </label>
      <textarea
        id="text-input"
        className="text-input"
        name="text"
        rows="6"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Écrivez ici le texte à synthétiser..."
      />

      <label htmlFor="language-select" className="label-lg">
        Langue
      </label>
      <select
        id="language-select"
        className="language-select"
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        <option value="a">Anglais américain</option>
        <option value="b">Anglais britannique</option>
        <option value="e">Espagnol</option>
        <option value="f">Français</option>
        <option value="h">Hindi</option>
        <option value="i">Italien</option>
        <option value="p">Portugais brésilien</option>
      </select>

      <button type="submit" className="btn-primary" disabled={isLoading || !text.trim()}>
        {isLoading ? 'Conversion...' : 'Convertir en audio'}
      </button>
    </form>
  )
}

