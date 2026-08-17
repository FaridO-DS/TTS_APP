import { useState } from 'react'
import './App.css'
import Form from './components/Form'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function App() {
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('a')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [audioUrl, setAudioUrl] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!text.trim()) {
      setStatus('Veuillez saisir un texte à convertir.')
      return
    }

    setIsLoading(true)
    setStatus('Conversion en cours...')

    try {
      const response = await fetch(`${API_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'La conversion a échoué.')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || 'Conversion échouée.')
      }

      const downloadUrl = result.data?.download_url
      if (!downloadUrl) {
        throw new Error('URL de téléchargement manquante.')
      }

      const audioResponse = await fetch(`${API_URL}${downloadUrl}`)
      if (!audioResponse.ok) {
        throw new Error('Impossible de télécharger le fichier audio.')
      }

      const audioBlob = await audioResponse.blob()
      const nextUrl = URL.createObjectURL(audioBlob)
      setAudioUrl((previousUrl) => {
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl)
        }
        return nextUrl
      })
      setStatus('Audio prêt à être écouté.')
    } catch (error) {
      setStatus(error.message || 'Une erreur est survenue.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <h1>VocalEase</h1>
      <p className="subtitle">Saisissez un texte et générez immédiatement un audio vocal.</p>
      <Form
        text={text}
        setText={setText}
        language={language}
        setLanguage={setLanguage}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <p className="status">{status}</p>
      {audioUrl && (
        <div className="download-card">
          <audio controls src={audioUrl} className="audio-player" />
          <a href={audioUrl} download="speech.wav" className="download-link">
            Télécharger le fichier audio
          </a>
        </div>
      )}
    </div>
  )
}


