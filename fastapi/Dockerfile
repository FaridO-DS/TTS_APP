# 1. Utilisation de l'image officielle UV basée sur Python 3.11 (Alpine)
FROM ghcr.io/astral-sh/uv:python3.11-alpine

WORKDIR /app

# 2. Mise à jour système et installation des bibliothèques audio requises
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache libsndfile ffmpeg

# 3. Copie des fichiers de configuration spécifiques à votre environnement UV (si présents)
COPY pyproject.toml uv.lock* ./

# 4. Installation directe et explicite de vos dépendances dans le système du conteneur
RUN uv pip install --system kokoro soundfile numpy python-dotenv uvicorn fastapi pydantic axios

# 5. Copie du reste de votre code source Python
COPY . .

# 6. Configuration du dossier permanent pour le cache du modèle Kokoro
ENV HF_HOME=/root/.cache/huggingface

EXPOSE 8000

CMD ["uvicorn", "api_app:api", "--host", "0.0.0.0", "--port", "8000"]
