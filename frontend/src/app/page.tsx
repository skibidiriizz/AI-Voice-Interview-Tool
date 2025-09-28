'use client';

import { useState } from 'react';
import InterviewInterface from '@/components/InterviewInterface';
import SetupScreen from '@/components/SetupScreen';

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [interviewType, setInterviewType] = useState<'general' | 'technical' | 'hr'>('general');

  const handleStartInterview = (id: string, type: 'general' | 'technical' | 'hr') => {
    setSessionId(id);
    setInterviewType(type);
  };

  const handleEndInterview = () => {
    setSessionId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!sessionId ? (
        <SetupScreen onStartInterview={handleStartInterview} />
      ) : (
        <InterviewInterface 
          sessionId={sessionId} 
          interviewType={interviewType}
          onEndInterview={handleEndInterview}
        />
      )}
    </div>
  );
}
