import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Generiert eine ZIP-Datei mit Markdown und hochgeladenen Dateien
 */
export const generateZip = async (markdownContent, files, filename, onProgress) => {
  const zip = new JSZip();
  
  // Markdown-Datei hinzufügen
  zip.file('dokumentation.md', markdownContent);
  
  // Unterordner für Dateien
  const uploads = zip.folder('uploads');
  
  // Fortschrittsberechnung
  const totalFiles = files.length;
  let processedFiles = 0;
  
  // Dateien hinzufügen
  for (const file of files) {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      uploads.file(file.name, blob);
      
      processedFiles++;
      if (onProgress) {
        onProgress(processedFiles / (totalFiles + 1));
      }
    } catch (error) {
      console.error(`Fehler beim Hinzufügen der Datei ${file.name}:`, error);
    }
  }
  
  // ZIP generieren und herunterladen
  zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  }, (metadata) => {
    if (onProgress) {
      onProgress((totalFiles + metadata.percent / 100) / (totalFiles + 1));
    }
  }).then((blob) => {
    saveAs(blob, filename);
    if (onProgress) {
      onProgress(1);
    }
  });
};