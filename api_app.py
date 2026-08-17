# This is a test script for the Kokoro TTS model. It demonstrates how to use the KPipeline class to convert text to speech and return an audio WAV response.
import io
import logging
import os
import uuid
import numpy as np
import soundfile as sf
from kokoro import KPipeline
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

# 'a' = American English. Other codes: 'b' British, 'e' Spanish,
# 'f' French, 'h' Hindi, 'i' Italian,
# 'p' Brazilian Portuguese.

MAX_TEXT_LENGTH = 500
OUTPUT_DIR = "./audio_store"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tts_api")

api = FastAPI(title="TTS_API")

# Allow CORS configuration from environment for local development and deployment
frontend_origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
api.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in frontend_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request and response models using Pydantic
class TTSRequest(BaseModel):
    text: str
    language: str = "a"  # Default to American English if not specified

class APIResponse(BaseModel):
    success: bool
    message: str
    data: dict | None = None
    error: str | None = None


@api.get("/")
async def bienvenue():
    return APIResponse(success=True, message="TTS API is running.", data={"status": "ok"})


code_to_languages = {
    "a": "American English",
    "b": "British",
    "e": "Spanish",
    "f": "French",
    "h": "Hindi",
    "i": "Italian",
    "p": "Brazilian Portuguese",
}

pipelines = {}
os.environ["HF_TOKEN"] = "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"
def get_pipeline(language: str):
    if language not in pipelines:
        logger.info("Creating pipeline for language %s", language)
        pipelines[language] = KPipeline(lang_code=language,repo_id="hexgrad/Kokoro-82M")
        return pipelines[language]

@api.post("/tts", response_model=APIResponse)
async def synthesize_text(payload: TTSRequest):
    logger.info("Received TTS request for language=%s", payload.language)
    text = payload.text.strip()
    language = (payload.language or "a").strip().lower()

    if not text:
        logger.warning("Empty text received")
        raise HTTPException(status_code=400, detail="No text provided for TTS conversion.")
    if len(text) > MAX_TEXT_LENGTH:
        logger.warning("Text too long: %s characters", len(text))
        raise HTTPException(status_code=400, detail=f"Text is too long. Maximum length is {MAX_TEXT_LENGTH} characters.")
    if language not in code_to_languages:
        logger.warning("Unsupported language code: %s", language)
        raise HTTPException(status_code=400, detail="Unsupported language code.")

    try:
        pipeline = get_pipeline(language)
        audio_chunks = []
        voices = {"a": "af_bella",
          "b": "bf_emma",
          "f": "ff_siwis", 
          "e": "ef_dora", 
          "h": "hf_alpha", 
          "i": "if_sara", 
          "p": "pf_dora", 
         }
        for _, _, chunk in pipeline(text, voice=voices.get(language), speed=0.8):
            audio_chunks.append(chunk)

        if not audio_chunks:
            logger.error("Kokoro returned no audio chunks for language=%s", language)
            raise HTTPException(status_code=500, detail="No audio generated.")

        audio = np.concatenate(audio_chunks)
        wav_buffer = io.BytesIO()
        sf.write(wav_buffer, audio, 24000, format="WAV")
        wav_bytes = wav_buffer.getvalue()
        output_path = os.path.join(OUTPUT_DIR, f"{language}_speech.wav")
        with open(output_path, "wb") as output_file:
            output_file.write(wav_bytes)

        logger.info("Audio generated successfully for language=%s", language)
        return APIResponse(
            success=True,
            message="Audio generated successfully.",
            data={
                "download_url": f"/audio_file?file={language}_speech.wav",
                "filename": f"{language}_speech.wav",
                "language": language,
            },
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to synthesize audio for language=%s", language)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@api.get("/audio_file")
async def get_audio_file(file: str):
    file_path = os.path.join(OUTPUT_DIR, file)
    if not os.path.exists(file_path):
        logger.warning("Audio file not found: %s", file)
        raise HTTPException(status_code=404, detail="Audio file not found.")
    return FileResponse(file_path, media_type="audio/wav", filename=file)


