# 🎤 AI Voice Interview Tool

A comprehensive full-stack application that conducts AI-powered voice interviews with real-time speech-to-text, intelligent questioning, and text-to-speech responses.

## 🚀 Features

- **Voice Input**: Real-time microphone recording and audio processing
- **Speech-to-Text**: Convert spoken responses to text using OpenAI Whisper API
- **AI Interviewer**: Intelligent interview questions powered by GPT-4o-mini
- **Text-to-Speech**: AI responses converted back to speech
- **Multiple Interview Types**: General, Technical, and HR interviews
- **Real-time Conversation**: Two-panel interface showing candidate and interviewer
- **PDF Export**: Generate comprehensive interview reports
- **Session Management**: Maintain conversation history and context

## 🏗️ Architecture

```
AI-Voice-Interview-Tool/
├── backend/                 # FastAPI Python backend
│   ├── main.py             # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Backend Docker configuration
├── frontend/               # Next.js React frontend
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   └── components/    # React components
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile        # Frontend Docker configuration
├── docker-compose.yml     # Multi-container setup
├── .env.example          # Environment variables template
└── README.md            # This file
```

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.11 or higher)
- **OpenAI API Key** with access to:
  - Whisper (Speech-to-Text)
  - GPT-4o-mini (Chat Completions)
  - TTS-1 (Text-to-Speech)

## 🛠️ Installation & Setup

### Method 1: Manual Setup (Recommended for Development)

#### 1. Clone and Navigate
```bash
git clone <repository-url>
cd AI-Voice-Interview-Tool
```

#### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your OpenAI API key
# OPENAI_API_KEY=your_actual_api_key_here
```

#### 3. Backend Setup
```bash
cd backend

# Create virtual environment (recommended)
python -m venv interview_env
source interview_env/bin/activate  # On Windows: interview_env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: `http://localhost:8000`

#### 4. Frontend Setup (New Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

### Method 2: Docker Setup

#### 1. Setup Environment
```bash
# Copy and configure environment file
cp .env.example .env
# Edit .env with your OpenAI API key
```

#### 2. Run with Docker Compose
```bash
# Start both frontend and backend
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

## 🎯 How to Use

### 1. **Start Interview**
   - Open `http://localhost:3000` in your browser
   - Select interview type (General, Technical, or HR)
   - Click "Start Interview"

### 2. **Grant Permissions**
   - Allow microphone access when prompted
   - Ensure good audio quality (quiet environment)

### 3. **Conduct Interview**
   - Wait for AI interviewer's first question
   - Click "Start Recording" to answer
   - Speak clearly and naturally
   - Click "Stop Recording" when finished
   - View real-time transcript and AI response

### 4. **Export Results**
   - Click "📄 Export PDF" to generate report
   - Download includes full transcript and evaluation
   - Click "End Interview" when finished

## 🔧 API Endpoints

### Backend (FastAPI)
- `POST /create_session` - Initialize new interview session
- `POST /transcribe` - Convert audio to text
- `POST /interview` - Process candidate response and get AI question
- `POST /tts` - Convert text to speech
- `GET /session/{session_id}` - Get session information
- `GET /session/{session_id}/export` - Export session data

## 🎨 Technical Features

### Frontend (Next.js + React)
- **Real-time Audio Recording**: WebRTC MediaRecorder API
- **Responsive Design**: TailwindCSS with mobile support
- **State Management**: React hooks for session management
- **PDF Generation**: jsPDF for client-side report generation
- **TypeScript**: Full type safety throughout

### Backend (FastAPI + Python)
- **Async/Await**: High-performance async request handling
- **OpenAI Integration**: Latest OpenAI Python SDK
- **CORS Support**: Cross-origin requests enabled
- **Session Management**: In-memory session storage
- **Error Handling**: Comprehensive error responses

## 🔒 Security & Privacy

- **API Key Protection**: Environment variables only
- **Session Isolation**: Unique session IDs
- **Data Privacy**: No persistent storage of conversations
- **HTTPS Ready**: Production-ready configuration

## 🐛 Troubleshooting

### Common Issues

**Microphone Not Working**
- Ensure browser has microphone permissions
- Check if other applications are using microphone
- Try refreshing the page

**OpenAI API Errors**
- Verify API key is correct in `.env` file
- Check OpenAI account has sufficient credits
- Ensure API key has access to required models

**Backend Connection Issues**
- Verify backend is running on port 8000
- Check firewall settings
- Ensure CORS is properly configured

**Audio Playback Issues**
- Check browser audio permissions
- Verify speakers/headphones are working
- Try different browser if issues persist

## 📊 Example Conversation Demo

```
AI Interviewer: "Hello! Welcome to your interview. Please start by telling me your name and a brief introduction about yourself."

Candidate: "Hi! My name is John Smith. I'm a software engineer with 5 years of experience in full-stack development, primarily working with React and Node.js."

AI Interviewer: "Great to meet you, John! Can you tell me about a challenging project you've worked on recently and how you overcame the technical difficulties?"

[Conversation continues...]
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   export OPENAI_API_KEY=your_production_key
   ```

2. **Backend Production**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

3. **Frontend Production**
   ```bash
   cd frontend
   npm install
   npm run build
   npm start
   ```

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing powerful AI APIs
- FastAPI for excellent Python web framework
- Next.js team for React framework
- All contributors and testers

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

**Built with ❤️ using FastAPI, Next.js, and OpenAI APIs**