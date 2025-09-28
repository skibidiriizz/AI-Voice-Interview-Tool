'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob) => void;
  isProcessing: boolean;
  currentTranscript: string;
}

export default function AudioRecorder({ 
  onAudioRecorded, 
  isProcessing, 
  currentTranscript 
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Request microphone permission on component mount
    requestPermission();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately after getting permission
      setHasPermission(true);
      setError(null);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access to continue.');
      setHasPermission(false);
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      await requestPermission();
      if (!hasPermission) return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onAudioRecorded(audioBlob);
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(100); // Record in 100ms chunks
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Failed to start recording. Please check your microphone.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingButtonClass = () => {
    if (isProcessing) {
      return 'bg-gray-400 cursor-not-allowed';
    }
    if (isRecording) {
      return 'bg-red-600 hover:bg-red-700 animate-pulse';
    }
    return 'bg-blue-600 hover:bg-blue-700';
  };

  const getRecordingButtonText = () => {
    if (isProcessing) {
      return 'Processing...';
    }
    if (isRecording) {
      return `Stop Recording (${formatTime(recordingTime)})`;
    }
    return 'Start Recording';
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
          {!hasPermission && (
            <button
              onClick={requestPermission}
              className="mt-2 text-sm text-red-700 underline hover:text-red-800"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      <div className="text-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || !hasPermission}
          className={`w-full px-6 py-4 rounded-lg font-semibold text-white transition-all ${getRecordingButtonClass()}`}
        >
          {getRecordingButtonText()}
        </button>
      </div>

      {isRecording && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <p className="text-red-700 font-medium">Recording...</p>
          </div>
          <p className="text-sm text-red-600 mt-1">Speak clearly into your microphone</p>
        </div>
      )}

      {currentTranscript && !isRecording && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Last Transcript:</h4>
          <p className="text-blue-700 italic">"{currentTranscript}"</p>
        </div>
      )}

      <div className="text-center text-sm text-gray-500">
        <p>💡 Tips:</p>
        <ul className="mt-1 space-y-1">
          <li>• Speak clearly and at normal pace</li>
          <li>• Find a quiet environment</li>
          <li>• Keep recording under 2 minutes</li>
        </ul>
      </div>
    </div>
  );
}