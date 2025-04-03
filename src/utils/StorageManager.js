const STORAGE_KEY = 'voice_doku_drafts';

/**
 * Lädt einen gespeicherten Entwurf aus dem localStorage
 */
export const loadDraft = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error('Fehler beim Laden des Entwurfs:', error);
    return null;
  }
};

/**
 * Speichert einen Entwurf im localStorage
 */
export const saveDraft = (content) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  } catch (error) {
    console.error('Fehler beim Speichern des Entwurfs:', error);
  }
};

/**
 * Löscht einen gespeicherten Entwurf
 */
export const clearDraft = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Fehler beim Löschen des Entwurfs:', error);
  }
};

/**
 * Gibt den Speicherstatus zurück
 */
export const getStorageStatus = () => {
  return {
    hasDraft: !!localStorage.getItem(STORAGE_KEY),
    lastModified: localStorage.getItem(`${STORAGE_KEY}_timestamp`)
  };
};