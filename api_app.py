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
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

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
    language: str 

codes = {
     "a":"American English",
     "b":"British",
     "e":"Spanish",
     "f":"French",
     "h":"Hindi",
     "i":"Italian",
     "p":"Brazilian Portuguese",
}

voices = {"a": "af_bella",
          "b": "bf_emma",
          "f": "ff_siwis", 
          "e": "ef_dora", 
          "h": "hf_alpha", 
          "i": "if_sara", 
          "p": "pf_dora", 
         }

pipelines = {}
os.environ["HF_TOKEN"] = "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"

def get_pipeline(language: str):
    if language not in pipelines:
        logger.info("Creating pipeline for language = %s", codes.get(language))
        pipelines[language] = KPipeline(lang_code=language,repo_id="hexgrad/Kokoro-82M")
    return pipelines[language]

@api.get("/")
async def Bienvenue():
    return {"success": True, "message" : "TTS API is running.", "status": "ok"}

@api.post("/tts")
async def synthesize_text(payload: TTSRequest):
    logger.info("Received TTS request for language code = %s", payload.language)
    text = payload.text.strip()
    language = (payload.language or "a").strip().lower()

    if not text:
        raise HTTPException(status_code=400, detail="No text provided for TTS conversion.")
    if len(text) > MAX_TEXT_LENGTH:
        raise HTTPException(status_code=400, detail=f"Text is too long. Maximum length is {MAX_TEXT_LENGTH} characters.")
    if language not in codes:
        logger.warning("Unsupported language code: %s", language)
        raise HTTPException(status_code=400, detail="Unsupported language code.")

    try:
        pipeline = get_pipeline(language)
        voice = voices.get(language)
        
        audio_chunks = [chunk for _, _, chunk in pipeline(text, voice, speed=0.8)]

        if not audio_chunks:
            logger.error("Kokoro returned no audio chunks for language = %s", codes.get(language))
            raise HTTPException(status_code=500, detail="No audio generated.")

        audio = np.concatenate(audio_chunks)

        wav_buffer = io.BytesIO()
        sf.write(wav_buffer, audio, 24000, format="WAV")
        wav_buffer.seek(0)
        
        logger.info("Audio generated successfully for language = %s", codes.get(language))

        return StreamingResponse(wav_buffer, media_type="audio/wav")
    
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to synthesize audio for language = %s", codes.get(language))
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@api.get("/audio_file")
async def get_audio_file(file: str):
    file_path = os.path.join(OUTPUT_DIR, file)
    if not os.path.exists(file_path):
        logger.warning("Audio file not found: %s", file)
        raise HTTPException(status_code=404, detail="Audio file not found.")
    return FileResponse(file_path, media_type="audio/wav", filename=file)


