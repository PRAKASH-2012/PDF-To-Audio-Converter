# 🎧 VoxLingo — PDF to Audio Converter, AI Summarizer & Multilingual Studio

A full-stack web application built strictly with **HTML5, CSS3, and JavaScript on the frontend** and **JavaScript (Node.js & Express) on the backend**. 

VoxLingo allows users to upload any PDF document (or voice dictate / type notes), extract its text in-memory, generate **AI Executive Summaries & Key Takeaways**, translate it into **50+ languages**, and listen to it with an interactive **Karaoke Speech Player** (real-time sentence-by-sentence highlighting) or export to **MP3 Audio, Timed Subtitles (.SRT), and Bilingual Transcripts**.

---

## ✨ Available Features

### 1. ⚡ Fast In-Memory PDF Parser
- Upload PDF files up to 35MB via drag-and-drop or file picker.
- Extracts multi-page text, page counts, word/character statistics, and estimated reading time.
- 100% in-memory processing (`multer.memoryStorage()`) — no temporary PDF files saved on disk for complete data privacy.
- Built-in multi-page filter: read and translate page-by-page or the entire document.

### 2. 🧠 AI Executive Summarizer & Key Takeaways
- Click **"AI Summary"** to generate an executive brief and bullet-point salient insights from any document.
- Topical keyword detection and reduction rate badge (e.g. `75% condensed`).
- 1-click **"Listen to Summary"** or **"Translate Summary"** into any target language.

### 3. 🎙️ Live Voice Dictation (Speech-to-Text)
- Click the **Microphone** button to speak your thoughts or notes directly into the studio using the Web Speech Recognition API.
- Live pulsating recording indicator with real-time transcription.

### 4. 🌐 Multilingual Translation Engine (50+ Languages)
- Translates into Spanish, French, German, Hindi, Japanese, Chinese, Russian, Arabic, Portuguese, Italian, Korean, and dozens more.
- Intelligent paragraph and sentence chunking splits long chapters and documents safely without hitting API bounds.
- Automatic source language detection and Quick Popular Language Chips (`ES`, `FR`, `DE`, `HI`, `JA`).

### 5. 🎙️ Dual Audio Engine & Speech Studio
- **Interactive Karaoke Speech Player (Web Speech API)**: Zero-latency browser speech synthesis with real-time sentence-by-sentence glowing highlights and auto-scroll tracking.
- **High-Definition MP3 Generator (Server-Side Node.js)**: Synthesizes audio on the backend via chunked speech synthesis and streams or downloads clean `.mp3` files.
- **Repeat / Loop Sentence**: Loop the currently playing sentence for language learners and pronunciation practice.
- **Audio Sleep Timer**: Set a timer for 5, 15, 30, or 60 minutes with a live countdown clock that automatically stops playback.
- **Quick Speed Chips & Tuning**: 1-click speed presets (`0.75x`, `1.0x`, `1.25x`, `1.5x`), precision pitch slider, and volume control with mute toggle.

### 6. 🔍 In-Text Search & Word Highlighter
- Real-time in-text search for both original and translated text boxes.
- Highlights matched search queries with live match count badges.

### 7. 📂 Multi-Format Export Studio
- **Download MP3 Audio**: Synthesized speech stream saved directly as an `.mp3` audio file.
- **Download Subtitles (.SRT)**: Timed subtitle tracks matching sentence timings for video/media players.
- **Download Bilingual Transcript**: Side-by-side or alternating dual-language transcript document.
- **Plain Text (.TXT)**: Clean exported text of translations.

### 8. 👓 Ergonomics & Zen Focus Mode
- Dynamic Font Resizing (`A-` and `A+`) from 12px to 24px.
- **Zen Focus Fullscreen Reader**: Distraction-free full-viewport reading canvas (toggle with header button or press `Esc`).

### 9. 🕒 Session History & Quick Restore
- Automatically stores recent conversions in `localStorage`.
- Click **"History"** to view and restore previous document sessions in 1 click.

### 10. 🎨 Modern Cyber-Glassmorphism UI
- Rich, responsive design with backdrop blur filters, glowing border accents, and typography (*Outfit* & *Inter* fonts).
- Daylight & Cyber Dark theme switcher.
- Preloaded deep space exploration sample PDF for instant 1-click testing.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5 Semantic Markup, Vanilla CSS3 (Custom Design System, Glassmorphism, Responsive Grid), Vanilla JavaScript (ES6+, Web Speech API, Speech Recognition, HTML5 Canvas) |
| **Backend** | JavaScript Only — Node.js (v18+ or v24+), Express.js |
| **Libraries** | `pdf-parse` (In-memory PDF text extraction), `multer` (Multipart upload handling), `google-tts-api` (MP3 audio synthesis), `pdf-lib` (Sample PDF generation), `cors` |

---

## 📁 Project Directory Structure

```text
IDE/
├── public/
│   ├── index.html        # Modern semantic HTML layout & accessible DOM
│   ├── style.css         # Cyber-glassmorphism design system & animations
│   ├── app.js            # Client-side state, drag-drop, speech karaoke, visualizer
│   └── sample.pdf        # Pre-generated sample PDF about deep space exploration
├── server.js             # Node.js Express backend (JavaScript only)
├── generate-sample.js    # Script to regenerate sample.pdf using pdf-lib
├── package.json          # Project metadata, dependencies, and start scripts
└── README.md             # Complete documentation and API reference
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### 2. Installation
Open your terminal in the project directory and install dependencies:
```bash
npm install
```

### 3. Start the Application
Run the start command:
```bash
npm start
```
Or for auto-reloading development mode:
```bash
npm run dev
```

### 4. Open in Your Browser
Navigate to:
```text
http://localhost:3000
```

---

## 📡 Backend API Reference

| Endpoint | Method | Request Body / Params | Description |
| :--- | :--- | :--- | :--- |
| `/api/languages` | `GET` | None | Returns the list of 43+ supported languages with flags and native names |
| `/api/extract-pdf` | `POST` | `multipart/form-data` with `pdf` | Extracts text, page counts, word counts, and metadata from uploaded PDF |
| `/api/summarize` | `POST` | `{ text }` | Generates executive summary, bullet points, keywords, and reduction stats |
| `/api/translate` | `POST` | `{ text, targetLang, sourceLang }` | Translates text into target language using intelligent chunking |
| `/api/synthesize` | `POST` | `{ text, lang, speed, returnFormat }` | Generates MP3 audio buffer / base64 URI for playback or download |
| `/api/download-audio`| `GET` | `?text=...&lang=...&speed=...` | Direct download endpoint for translated MP3 audio |
| `/api/export-srt` | `POST` | `{ text, speed }` | Generates synchronized `.srt` subtitle file |
| `/api/export-bilingual`| `POST`| `{ originalText, translatedText }` | Generates dual-language side-by-side transcript document |
| `/api/sample-pdf` | `GET` | None | Serves the preloaded sample PDF document |
| `/api/health` | `GET` | None | Service status and Node.js runtime information |

---

## 📄 License
ISC
>>>>>>> 8da3265 (feat: initial commit of VoxLingo - PDF to Audio Converter, AI Summarizer and Multilingual Translator)
