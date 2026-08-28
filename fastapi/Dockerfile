# 1. Utilisation de l'image officielle UV basée sur Python 3.11 (Debian Slim)
FROM ghcr.io/astral-sh/uv:python3.11-slim

WORKDIR /app

# 2. Mise à jour système et installation des outils audio (syntaxe Debian/Apt)
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y libsndfile1 ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# 3. Copie des fichiers de configuration spécifiques à votre environnement UV (si présents)
COPY pyproject.toml uv.lock* ./

# 4. Installation directe, rapide et propre de vos dépendances via UV
RUN uv pip install --system kokoro soundfile numpy python-dotenv uvicorn fastapi pydantic axios

# 5. Copie du reste de votre code source Python (y compris le script et le .env)
COPY . .

# 6. Configuration du dossier permanent pour le cache du modèle Kokoro
ENV HF_HOME=/root/.cache/huggingface

EXPOSE 8000

CMD ["uvicorn", "api_app:api", "--host", "0.0.0.0", "--port", "8000"]
