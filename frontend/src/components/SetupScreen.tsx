'use client';

import { useState } from 'react';
import axios from 'axios';

interface SetupScreenProps {
  onStartInterview: (sessionId: string, type: 'general' | 'technical' | 'hr') => void;
}

export default function SetupScreen({ onStartInterview }: SetupScreenProps) {
  const [selectedType, setSelectedType] = useState<'general' | 'technical' | 'hr'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interviewTypes = {
    general: {
      title: 'General Interview',
      description: 'Standard job interview covering general topics and experience',
      icon: '💼'
    },
    technical: {
      title: 'Technical Interview',
      description: 'Focused on programming, algorithms, and technical skills',
      icon: '💻'
    },
    hr: {
      title: 'HR Interview',
      description: 'Behavioral questions and cultural fit assessment',
      icon: '👥'
    }
  };

  const handleStartInterview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8000/create_session', {
        interview_type: selectedType
      });

      if (response.data.session_id) {
        onStartInterview(response.data.session_id, selectedType);
      } else {
        throw new Error('Failed to create session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start interview');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎤 AI Voice Interview Tool
          </h1>
          <p className="text-lg text-gray-600">
            Practice your interview skills with our AI interviewer. 
            Choose your interview type and start speaking!
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Select Interview Type</h2>
          <div className="grid gap-4">
            {Object.entries(interviewTypes).map(([key, type]) => (
              <div 
                key={key}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedType === key 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedType(key as 'general' | 'technical' | 'hr')}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{type.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{type.title}</h3>
                    <p className="text-gray-600">{type.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedType === key 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedType === key && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleStartInterview}
            disabled={isLoading}
            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            } text-white`}
          >
            {isLoading ? 'Starting Interview...' : 'Start Interview'}
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🎧 Make sure your microphone is working</p>
          <p>🔊 Enable audio for the best experience</p>
        </div>
      </div>
    </div>
  );
}