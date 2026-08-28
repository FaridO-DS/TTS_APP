FROM python:3.11-slim-bookworm

WORKDIR /app

# 2. Copie du binaire officiel de 'uv' depuis l'image scratch d'Astral
COPY --from=docker.io/astral/uv:latest /uv /uvx /bin/

# 3. Mise à jour système et installation des outils audio (syntaxe Debian/Apt)
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y libsndfile1 ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# 4. Copie des fichiers de configuration spécifiques à votre environnement UV (si présents)
COPY pyproject.toml uv.lock* ./

# 5. Installation directe et explicite de vos dépendances dans le système du conteneur
RUN uv pip install --system kokoro soundfile numpy python-dotenv uvicorn fastapi pydantic axios

# 6. Copie du reste de votre code source Python
COPY . .

# 7. Configuration du dossier permanent pour le cache du modèle Kokoro
ENV HF_HOME=/root/.cache/huggingface

EXPOSE 8000

CMD ["uvicorn", "api_app:api", "--host", "0.0.0.0", "--port", "8000"]
