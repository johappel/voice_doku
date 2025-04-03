import React, { useState, useEffect, useCallback } from 'react';
import VoiceRecorder from './components/VoiceRecorder';
import TranscriptionTicker from './components/TranscriptionTicker';
import MarkdownEditor from './components/MarkdownEditor';
import FileUploader from './components/FileUploader';
import DownloadSection from './components/DownloadSection';
import { getFiles } from './services/FileService';
import { getDefaultTemplate } from './utils/TemplateManager';
import { loadDraft, saveDraft } from './utils/StorageManager';
import './styles/main.css';

const App = () => {
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(getDefaultTemplate());
  const [files, setFiles] = useState([]);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);

  const toggleEditorFullscreen = useCallback(() => {
    setIsEditorFullscreen(prev => !prev);
  }, []);

  // Entwurf aus dem LocalStorage laden
  useEffect(() => {
    const savedContent = loadDraft();
    if (savedContent) {
      setMarkdownContent(savedContent);
    }
  }, []);

  // Automatisches Speichern alle 30 Sekunden
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveDraft(markdownContent);
    }, 30000);
    
    return () => clearInterval(saveInterval);
  }, [markdownContent]);

  // Dateien-Liste aktualisieren
  useEffect(() => {
    const updateFiles = async () => {
      const filesList = await getFiles();
      setFiles(filesList);
    };
    
    updateFiles();
  }, []);

  // Handler für Transkriptions-Updates
  const handleTranscriptionUpdate = (text) => {
    setTranscription(text);
  };

  // Handler für Markdown-Updates vom Editor
  const handleMarkdownUpdate = (content) => {
    setMarkdownContent(content);
    saveDraft(content);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Unterrichtsdokumentation</h1>
      </header>
      
      <main className="app-content">
        <section className="voice-input-section">
          <VoiceRecorder onTranscriptionUpdate={handleTranscriptionUpdate} />
          <TranscriptionTicker 
            transcription={transcription}
            isProcessing={isProcessing} 
          />
        </section>
        
        <section className={`editor-section ${isEditorFullscreen ? 'fullscreen' : ''}`}>
          <MarkdownEditor
            transcription={transcription}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            markdownContent={markdownContent}
            onMarkdownUpdate={handleMarkdownUpdate}
            onToggleFullscreen={toggleEditorFullscreen}
          />
        </section>
        
        <section className="file-management-section">
          <div className="file-upload-container">
            <FileUploader onFilesUpdate={() => getFiles().then(setFiles)} />
          </div>
          
          <div className="download-container">
            <DownloadSection 
              markdownContent={markdownContent}
              files={files}
            />
          </div>
        </section>
      </main>
      
      <footer className="app-footer">
        <p>© 2025 Unterrichtsdokumentations-Tool</p>
      </footer>
    </div>
  );
};

export default App;