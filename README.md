# Speechy 🎙️ — Multi-Language AI Text-to-Speech Platform

Speechy is a production-ready, full-stack web application that converts multi-language text inputs into high-quality audio files using the state-of-the-art **Kokoro AI Text-to-Speech model** [Kokoro]. Built with a modern **Monorepo architecture**, it decouples the web interface, a Node.js orchestration backend, and a high-performance Python FastAPI AI inference server.

🌍 **Live Demo:** https://speechy.f-oudghiri.dev
💼 **Portfolio :** https://f-oudghiri.dev

---

## 🚀 Key Features

* **Multi-Language Support:** Instant high-quality speech synthesis for English (US/UK), French, Spanish, Hindi, Italian, and Portuguese [Kokoro].
* **On-the-Fly Audio Compression:** Converts raw NumPy audio arrays directly in memory into compressed MP3 (`audio/mpeg`) chunks to save up to 90% bandwidth.
* **Hybrid Cloud Architecture:** Text metadata is stored in MongoDB, while binary streams are securely hosted on Cloudinary's global CDN [Cloudinary].
* **Strict Free Tier Token Gate:** Implements an un-bypassable generation limit (3 generations max) tied permanently to the database user profile, completely isolated from client-side history clearing.
* **Modern UI/UX:** Responsive Dark Mode interface crafted with React, Zustand, and Tailwind CSS.
* **Embedded Mini Player:** Play, pause, seek, and browse audio assets dynamically directly from the user's history list.

---

## 🏗️ Architecture & Data Flow

The platform relies on a modern, multi-server network architecture orchestrated via Docker containers [Nginx].

---

### The Generation Lifecycle:
1. **Frontend** submits `{ text, language }` to the **Express Backend**.
2. **Express** verifies session status and enforces the **Arcjet security layer** (anti-bot, DDoS mitigation).
3. **Express** checks the user's permanent `generationsCount` in **MongoDB**. If `< 3`, it passes the text to the **FastAPI internal service**.
4. **FastAPI** loads the **Kokoro-82M model**, synthesizes speech, encodes it into MP3 format via memory buffers, and streams it back.
5. **Express** intercepts the stream and pipes it directly to **Cloudinary** using secure server-side upload streams [Cloudinary].
6. **Express** saves the permanent HTTPS audio URL and exact duration into MongoDB, increments the user's token counter, and returns a clean JSON success payload to the client.

---

## 🛠️ Tech Stack

### Frontend
* **Core:** React 18, React Router DOM
* **State Management:** Zustand (Global State)
* **Styling:** Tailwind CSS (Futuristic Dark Mode Slate/Cyan theme)
* **Feedback:** React Hot Toast, Lucide React Icons

### Backend Orchestration
* **Runtime:** Node.js (v22) with Express
* **Database Object Modeling:** Mongoose (MongoDB)
* **Security & Shielding:** Arcjet Middleware (Rate-limiting & Bot Detection)
* **Cloud Storage CDN:** Cloudinary SDK (Server-to-Server Upload Streams) [Cloudinary]

### AI Inference Server
* **Framework:** Python 3.11 with FastAPI & Uvicorn
* **Package Manager:** `uv` (Fast Astral package installer)
* **AI Model:** Kokoro-82M (via `kokoro` library) [Kokoro]
* **Audio Engineering:** `soundfile`, `numpy` (Direct in-memory bytes compression)

### Infrastructure & DevOps
* **Hosting:** Dedicated VPS (4 vCPU, 4GB RAM, 125GB SSD) running Ubuntu
* **Containerization:** Docker & Docker Compose (Isolated networks)
* **Web Server:** Nginx (Reverse Proxy & Static Asset server) [Nginx]
* **Security:** Let's Encrypt SSL Certifications (**SSL Labs Grade: A**) [Nginx]

---

## 📂 Project Structure

```
TTS_APP/
├── backend/                  # Node.js Express Backend
│   ├── controllers/          # Business logic (TTS stream & Cloudinary management)
│   ├── middleware/           # Auth guarding & Arcjet firewall
│   ├── models/               # MongoDB Mongoose schemas (User, History)
│   ├── routes/               # API endpoint routing
│   └── Dockerfile            # Lightweight Node production container
│
├── fastapi/                  # Python FastAPI AI Inference Service
│   ├── api_app.py            # AI Engine endpoints & Hugging Face pipeline wrapping [Kokoro]
│   ├── pyproject.toml        # uv configuration file
│   └── Dockerfile            # Python 3.11 optimized Alpine container
│
├── frontend/                 # React UI Client SPA (Compiled to Nginx root)
│   ├── src/components/       # Isolated components (Form, HistoryList, AudioPlayer)
│   └── src/store/            # Zustand global storage stores
│
├── docker-compose.yml        # Multi-container orchestration workflow
└── README.md                 # Project documentation
```

---

## 🔧 Local & Production Deployment

### Prerequisites
* Docker & Docker Compose installed on your host machine.
* A Cloudinary account credentials [Cloudinary].
* A MongoDB connection URI.
* A Hugging Face account token (`HF_TOKEN`) [Kokoro].

### Environment Setup
Create a `.env` file inside the `backend/` directory:
```env
PORT=3000
MONGO_URI=mongodb+srv://...
CLIENT_URL=https://f-oudghiri.dev
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ARCJET_KEY=your_arcjet_key
```

Create a global `.env` file at `TTS_APP/fastapi`:
```env
HF_TOKEN=hf_your_huggingface_token_here
```

### Spinning up the Infrastructure
Launch the multi-container environment in detached mode using a single command:
```bash
sudo docker compose up --build -d
```
*Note: During the very first generation request, the FastAPI service will automatically pull down the 80MB Kokoro model weight directly into a **persistent Docker Volume** named `speechy_hf_cache`. Subsequent requests require zero download latency [Kokoro].*

---

## 👑 Administrative Commands

To manually override and reset the generation limits for a specific candidate or guest user profile during auditing, access the MongoDB shell (`mongosh`) on the host server [MongoDB]:

```javascript
// Connect to shell and swap to database
use speechy_db

// Reset a specific user's lifetime generations token
db.users.updateOne({ email: "guest@example.com" }, { \$set: { generationsCount: 0 } })
```

---

## 📝 License
This project is developed for educational and portfolio purposes. The Kokoro model weights are subject to their respective creators' open-source licensing.