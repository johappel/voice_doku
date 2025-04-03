import React, { useState } from 'react';
import { exportMarkdown } from '../utils/MarkdownConverter';
import { generateZip } from '../utils/ZipGenerator';
import '../styles/components/DownloadSection.css';

const DownloadSection = ({ markdownContent, files }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  const handleMarkdownExport = () => {
    exportMarkdown(markdownContent, 'unterrichtsdokumentation.md');
  };
  
  const handleZipExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      await generateZip(
        markdownContent, 
        files, 
        'unterrichtsdokumentation.zip',
        (progress) => setExportProgress(Math.round(progress * 100))
      );
    } catch (error) {
      console.error('Fehler beim Generieren des ZIP-Archivs:', error);
      alert('Beim Erstellen des ZIP-Archivs ist ein Fehler aufgetreten.');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="download-section">
      <h3>Export</h3>
      
      <div className="export-options">
        <button 
          className="export-button markdown-export"
          onClick={handleMarkdownExport}
          disabled={isExporting || !markdownContent}
        >
          Markdown exportieren
        </button>
        
        <button 
          className="export-button zip-export"
          onClick={handleZipExport}
          disabled={isExporting}
        >
          Alles als ZIP exportieren
        </button>
      </div>
      
      {isExporting && (
        <div className="export-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${exportProgress}%` }}
            ></div>
          </div>
          <div className="progress-label">{exportProgress}%</div>
        </div>
      )}
      
      <div className="export-instructions">
        <p>Der Markdown-Export enthält nur den Text ohne Anhänge.</p>
        <p>Der ZIP-Export enthält sowohl den Text als auch alle hochgeladenen Dateien.</p>
      </div>
    </div>
  );
};

export default DownloadSection;