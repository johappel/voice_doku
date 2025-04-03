import React, { useRef, useEffect } from 'react';
import '../styles/components/TranscriptionTicker.css';

const TranscriptionTicker = ({ transcription, isProcessing }) => {
  const tickerRef = useRef(null);
  
  useEffect(() => {
    if (tickerRef.current) {
      tickerRef.current.scrollTop = tickerRef.current.scrollHeight;
    }
  }, [transcription]);
  
  // Extrahiere die letzten 50 Wörter für die Ticker-Anzeige
  const lastWords = transcription.split(' ').slice(-50).join(' ');
  
  return (
    <div className="transcription-ticker-container">
      <div className="status-indicator">
        {isProcessing ? 'Verarbeitung...' : 'Bereit zur Verarbeitung'}
      </div>
      
      <div className="ticker-wrapper">
        <div className="ticker-label">Transkription:</div>
        <div className="ticker" ref={tickerRef}>
          {lastWords}
          {isProcessing && <span className="processing-cursor">|</span>}
        </div>
      </div>
      
      <div className="word-count">
        {transcription.split(/\s+/).filter(word => word.length > 0).length} Wörter
      </div>
    </div>
  );
};

export default TranscriptionTicker;