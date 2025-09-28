'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AudioRecorder from './AudioRecorder';
import ConversationPanel from './ConversationPanel';
import ExportButton from './ExportButton';

interface Message {
  role: 'candidate' | 'interviewer';
  content: string;
  timestamp: string;
  audioUrl?: string;
}

interface InterviewInterfaceProps {
  sessionId: string;
  interviewType: 'general' | 'technical' | 'hr';
  onEndInterview: () => void;
}

export default function InterviewInterface({ 
  sessionId, 
  interviewType, 
  onEndInterview 
}: InterviewInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the interview with the first AI question
  useEffect(() => {
    if (!isInitialized) {
      initializeInterview();
    }
  }, [sessionId, isInitialized]);

  const initializeInterview = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post('http://localhost:8000/interview', {
        session_id: sessionId,
        transcript: '',
        interview_type: interviewType
      });

      const newMessage: Message = {
        role: 'interviewer',
        content: response.data.interviewer_response,
        timestamp: new Date().toISOString(),
        audioUrl: `data:audio/mp3;base64,${response.data.audio_base64}`
      };

      setMessages([newMessage]);
      setIsInitialized(true);
    } catch (err) {
      setError('Failed to initialize interview');
      console.error('Initialization error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAudioRecorded = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      // First transcribe the audio
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');

      const transcribeResponse = await axios.post(
        'http://localhost:8000/transcribe',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const transcript = transcribeResponse.data.transcript;
      setCurrentTranscript(transcript);

      // Add candidate message
      const candidateMessage: Message = {
        role: 'candidate',
        content: transcript,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, candidateMessage]);

      // Get AI interviewer response
      const interviewResponse = await axios.post('http://localhost:8000/interview', {
        session_id: sessionId,
        transcript: transcript,
        interview_type: interviewType
      });

      const interviewerMessage: Message = {
        role: 'interviewer',
        content: interviewResponse.data.interviewer_response,
        timestamp: new Date().toISOString(),
        audioUrl: `data:audio/mp3;base64,${interviewResponse.data.audio_base64}`
      };

      setMessages(prev => [...prev, interviewerMessage]);

    } catch (err) {
      setError('Failed to process audio. Please try again.');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getInterviewTypeInfo = () => {
    const types = {
      general: { title: 'General Interview', icon: '💼', color: 'blue' },
      technical: { title: 'Technical Interview', icon: '💻', color: 'green' },
      hr: { title: 'HR Interview', icon: '👥', color: 'purple' }
    };
    return types[interviewType];
  };

  const typeInfo = getInterviewTypeInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{typeInfo.icon}</div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  {typeInfo.title}
                </h1>
                <p className="text-sm text-gray-500">Session ID: {sessionId.slice(0, 8)}...</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ExportButton sessionId={sessionId} />
              <button
                onClick={onEndInterview}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Candidate Panel */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="bg-blue-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="mr-2">🎤</span>
                Candidate (You)
              </h2>
            </div>
            <div className="p-6 h-full flex flex-col">
              <div className="flex-1 mb-6">
                <ConversationPanel 
                  messages={messages.filter(m => m.role === 'candidate')}
                  title="Your Responses"
                />
              </div>
              <div className="border-t pt-6">
                <AudioRecorder 
                  onAudioRecorded={handleAudioRecorded}
                  isProcessing={isProcessing}
                  currentTranscript={currentTranscript}
                />
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interviewer Panel */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="bg-green-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="mr-2">🤖</span>
                AI Interviewer
              </h2>
            </div>
            <div className="p-6 h-full">
              <ConversationPanel 
                messages={messages.filter(m => m.role === 'interviewer')}
                title="Interview Questions"
                showAudioControls={true}
              />
              {isProcessing && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="text-blue-600">AI is thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
