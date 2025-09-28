'use client';

import { useEffect, useRef } from 'react';

interface Message {
  role: 'candidate' | 'interviewer';
  content: string;
  timestamp: string;
  audioUrl?: string;
}

interface ConversationPanelProps {
  messages: Message[];
  title: string;
  showAudioControls?: boolean;
}

export default function ConversationPanel({ 
  messages, 
  title, 
  showAudioControls = false 
}: ConversationPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(err => {
      console.error('Error playing audio:', err);
    });
  };

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">
            {title === 'Your Responses' ? '🎤' : '🤖'}
          </div>
          <p>
            {title === 'Your Responses' 
              ? 'Your responses will appear here' 
              : 'AI questions will appear here'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((message, index) => (
          <div key={index} className="space-y-2">
            <div className={`p-4 rounded-lg ${
              message.role === 'candidate' 
                ? 'bg-blue-50 border-l-4 border-blue-400' 
                : 'bg-green-50 border-l-4 border-green-400'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                {showAudioControls && message.audioUrl && (
                  <button
                    onClick={() => playAudio(message.audioUrl!)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                    title="Play audio"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              <p className={`leading-relaxed ${
                message.role === 'candidate' 
                  ? 'text-blue-800' 
                  : 'text-green-800'
              }`}>
                {message.content}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}