import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { processTextWithLLM } from '../services/LLMProcessingService';
import { getDefaultTemplate } from '../utils/TemplateManager';
import { TemplateService } from '../services/TemplateService';
import '../styles/components/MarkdownEditor.css';

const MarkdownEditor = ({
  transcription,
  isProcessing,
  setIsProcessing,
  onMarkdownUpdate,
  onToggleFullscreen,
  isEditorFullscreen
}) => {
  const [markdownText, setMarkdownText] = useState(getDefaultTemplate());
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const loadedTemplates = await TemplateService.getAllTemplates();
        setTemplates(loadedTemplates);
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    };
    loadTemplates();
  }, []);

  const handleTemplateChange = async (e) => {
    const templateId = e.target.value;
    if (!templateId) return;
    
    try {
      const template = await TemplateService.getTemplateById(templateId);
      // Template loaded successfully
      setMarkdownText(template.content);
    } catch (error) {
      console.error('Failed to load template:', error);
      alert(`Template konnte nicht geladen werden: ${error.message}`);
    }
  };
  const [preview, setPreview] = useState('');
  const [viewMode, setViewMode] = useState('split'); // 'edit', 'preview', 'split'
  const prevTranscriptionRef = useRef('');
  
  // Aktualisieren der Vorschau, wenn der Markdown-Text geändert wird
  useEffect(() => {
    const html = DOMPurify.sanitize(marked.parse(markdownText));
    setPreview(html);
  }, [markdownText]);
  
  // Verarbeitung des Transkripts, wenn es sich ändert
  useEffect(() => {
    const processTranscription = async () => {
      const hasChanged = transcription !== prevTranscriptionRef.current;
      if (transcription.trim() && !isProcessing && hasChanged) {
        prevTranscriptionRef.current = transcription;
        setIsProcessing(true);
        try {
          const structuredText = await processTextWithLLM(transcription, markdownText);
          setMarkdownText(structuredText);
          const html = DOMPurify.sanitize(marked.parse(structuredText));
          setPreview(html);
        } catch (error) {
          console.error('Fehler bei der LLM-Verarbeitung:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    };
    
    // Debounce, um nicht bei jedem Wort die API aufzurufen
    const debounceTimer = setTimeout(processTranscription, 2000);
    
    return () => clearTimeout(debounceTimer);
  }, [transcription, isProcessing, setIsProcessing, markdownText]);
  
  const handleEditorChange = (e) => {
    setMarkdownText(e.target.value);
  };
  
  return (
    <div className="markdown-editor">
      <div className="editor-controls">
        <button
          className={viewMode === 'edit' ? 'active' : ''}
          onClick={() => setViewMode('edit')}
        >
          Bearbeiten
        </button>
        <button
          className={viewMode === 'preview' ? 'active' : ''}
          onClick={() => setViewMode('preview')}
        >
          Vorschau
        </button>
        <button
          className={viewMode === 'split' ? 'active' : ''}
          onClick={() => setViewMode('split')}
        >
          Split View
        </button>
        <button
          className="zoom-button"
          onClick={(e) => {
            e.preventDefault();
            requestAnimationFrame(() => {
              onToggleFullscreen();
            });
          }}
          title="Vollbildmodus"
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
        </button>
        <select
          className="template-selector"
          onChange={handleTemplateChange}
        >
          <option value="">Vorlage wählen</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className={`editor-container ${viewMode} ${isEditorFullscreen ? 'fullscreen' : ''}`}>
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="editor-pane">
            <textarea
              value={markdownText}
              onChange={handleEditorChange}
              placeholder="Markdown-Text eingeben oder per Sprache generieren lassen..."
              disabled={isProcessing}
            />
          </div>
        )}
        
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="preview-pane">
            <div 
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        )}
      </div>
      
      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-spinner"></div>
          <div>Verarbeite Transkription...</div>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;