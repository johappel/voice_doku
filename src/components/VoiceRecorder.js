import React, { useState, useEffect } from 'react';
import { startRecognition, stopRecognition } from '../services/VoiceRecognitionService';
import '../styles/components/VoiceRecorder.css';

const VoiceRecorder = ({ onTranscriptionUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  useEffect(() => {
    let audioContext;
    let analyser;
    let microphone;
    
    const setupAudioAnalysis = async () => {
      if (!isRecording) return;
      
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateAudioLevel = () => {
          if (!isRecording) return;
          
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          setAudioLevel(average);
          
          requestAnimationFrame(updateAudioLevel);
        };
        
        updateAudioLevel();
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };
    
    if (isRecording) {
      setupAudioAnalysis();
    }
    
    return () => {
      if (microphone) {
        microphone.disconnect();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isRecording]);
  
  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecognition();
      setIsRecording(false);
    } else {
      await startRecognition(onTranscriptionUpdate);
      setIsRecording(true);
    }
  };
  
  return (
    <div className="voice-recorder">
      <button 
        className={`record-button ${isRecording ? 'recording' : ''}`}
        onClick={toggleRecording}
      >
        {isRecording ? 'Aufnahme stoppen' : 'Aufnahme starten'}
      </button>
      
      {isRecording && (
        <div className="audio-visualizer">
          <div 
            className="audio-level" 
            style={{ height: `${Math.min(100, audioLevel)}%` }}
          />
        </div>
      )}
      
      <div className="recording-status">
        {isRecording ? 'Aufnahme läuft...' : 'Bereit zur Aufnahme'}
      </div>
    </div>
  );
};

export default VoiceRecorder;