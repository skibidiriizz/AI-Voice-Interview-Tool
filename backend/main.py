from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import OpenAI
from dotenv import load_dotenv
import os
import base64

# Load environment variables from parent directory
load_dotenv(dotenv_path='../.env')
import tempfile
import json
from typing import List, Dict, Any
from pydantic import BaseModel
import uuid
from datetime import datetime

app = FastAPI(title="AI Voice Interview Tool", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# In-memory storage for interview sessions
interview_sessions: Dict[str, Dict[str, Any]] = {}

# Request/Response models
class InterviewRequest(BaseModel):
    session_id: str
    transcript: str
    interview_type: str = "general"  # general, technical, hr

class InterviewResponse(BaseModel):
    session_id: str
    interviewer_response: str
    audio_base64: str
    conversation_history: List[Dict[str, str]]

class SessionRequest(BaseModel):
    interview_type: str = "general"

@app.get("/")
async def root():
    return {"message": "AI Voice Interview Tool API"}

@app.post("/create_session")
async def create_session(request: SessionRequest):
    """Create a new interview session"""
    session_id = str(uuid.uuid4())
    
    # Initialize session with system prompt
    system_prompts = {
        "general": """You are an AI Interviewer conducting a professional job interview. 
        Ask one structured question at a time. Evaluate candidate clarity, accuracy, and confidence.
        Keep your responses under 150 words. If the candidate struggles, simplify your question.
        Always remain professional and encouraging. Start with a welcome message and ask for their name.""",
        
        "technical": """You are an AI Technical Interviewer for software development positions.
        Ask technical questions about programming, algorithms, system design, and problem-solving.
        One question at a time, under 150 words. Adapt difficulty based on candidate responses.
        Start with a welcome and ask about their technical background.""",
        
        "hr": """You are an AI HR Interviewer focusing on behavioral and cultural fit questions.
        Ask about experience, teamwork, leadership, and company culture alignment.
        One question at a time, under 150 words. Be warm and professional.
        Start with a welcome and ask them to introduce themselves."""
    }
    
    interview_sessions[session_id] = {
        "id": session_id,
        "type": request.interview_type,
        "created_at": datetime.now().isoformat(),
        "conversation_history": [],
        "system_prompt": system_prompts.get(request.interview_type, system_prompts["general"])
    }
    
    return {"session_id": session_id, "message": "Session created successfully"}

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Convert audio to text using OpenAI Whisper"""
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Transcribe with OpenAI Whisper
        with open(temp_file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        return {"transcript": transcript.strip()}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/interview")
async def conduct_interview(request: InterviewRequest):
    """Process candidate response and generate interviewer question"""
    try:
        session = interview_sessions.get(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Add candidate response to conversation history
        if request.transcript.strip():
            session["conversation_history"].append({
                "role": "candidate",
                "content": request.transcript,
                "timestamp": datetime.now().isoformat()
            })
        
        # Prepare messages for OpenAI
        messages = [{"role": "system", "content": session["system_prompt"]}]
        
        # Add conversation history
        for entry in session["conversation_history"]:
            if entry["role"] == "candidate":
                messages.append({"role": "user", "content": entry["content"]})
            else:
                messages.append({"role": "assistant", "content": entry["content"]})
        
        # Get AI interviewer response
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=150,
            temperature=0.7
        )
        
        interviewer_response = response.choices[0].message.content
        
        # Add interviewer response to history
        session["conversation_history"].append({
            "role": "interviewer",
            "content": interviewer_response,
            "timestamp": datetime.now().isoformat()
        })
        
        # Generate audio for the response
        audio_base64 = await generate_speech(interviewer_response)
        
        return InterviewResponse(
            session_id=request.session_id,
            interviewer_response=interviewer_response,
            audio_base64=audio_base64,
            conversation_history=session["conversation_history"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview processing failed: {str(e)}")

@app.post("/tts")
async def text_to_speech(text: str):
    """Convert text to speech using OpenAI TTS"""
    try:
        audio_base64 = await generate_speech(text)
        return {"audio_base64": audio_base64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

async def generate_speech(text: str) -> str:
    """Helper function to generate speech from text"""
    try:
        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text,
            response_format="mp3"
        )
        
        # Convert to base64
        audio_base64 = base64.b64encode(response.content).decode('utf-8')
        return audio_base64
    
    except Exception as e:
        raise Exception(f"Speech generation failed: {str(e)}")

@app.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get session information and conversation history"""
    session = interview_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.get("/session/{session_id}/export")
async def export_session(session_id: str):
    """Export session as structured data for PDF generation"""
    session = interview_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Prepare export data
    export_data = {
        "session_info": {
            "id": session["id"],
            "type": session["type"],
            "created_at": session["created_at"],
            "duration": len(session["conversation_history"])
        },
        "conversation": session["conversation_history"],
        "evaluation": generate_evaluation(session["conversation_history"])
    }
    
    return export_data

def generate_evaluation(conversation_history: List[Dict[str, str]]) -> Dict[str, Any]:
    """Generate a simple evaluation based on conversation"""
    candidate_responses = [entry for entry in conversation_history if entry["role"] == "candidate"]
    
    evaluation = {
        "total_responses": len(candidate_responses),
        "average_response_length": sum(len(r["content"]) for r in candidate_responses) / len(candidate_responses) if candidate_responses else 0,
        "engagement_score": min(10, len(candidate_responses) * 2),  # Simple scoring
        "notes": "Automated evaluation based on response patterns and engagement."
    }
    
    return evaluation

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)