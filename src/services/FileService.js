// Temporärer Speicher für hochgeladene Dateien
let filesStorage = [];

/**
 * Fügt eine neue Datei zum Speicher hinzu
 */
export const addFile = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const fileData = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: e.target.result,
        lastModified: file.lastModified
      };
      
      filesStorage.push(fileData);
      resolve(fileData);
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Entfernt eine Datei aus dem Speicher
 */
export const removeFile = async (fileId) => {
  filesStorage = filesStorage.filter(file => file.id !== fileId);
};

/**
 * Gibt alle gespeicherten Dateien zurück
 */
export const getFiles = async () => {
  return [...filesStorage];
};

/**
 * Generiert eine Vorschau für eine Datei
 */
export const generatePreview = (file) => {
  if (file.type.startsWith('image/')) {
    return file.url;
  }
  
  // Für nicht-Bild-Dateien ein passendes Icon zurückgeben
  if (file.type === 'application/pdf') {
    return '/assets/icons/pdf-icon.png';
  }
  
  return '/assets/icons/file-icon.png';
};