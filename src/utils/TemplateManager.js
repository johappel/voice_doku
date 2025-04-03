/**
 * Gibt das Standard-Template für die Unterrichtsdokumentation zurück
 */
export const getDefaultTemplate = () => {
  return `# Thema oder Herausforderung 

Was sollten die Schüler lernen?

Kompetenzen

Lernziele 

Lernstoff

# Unterrichtsverlauf 

Einstieg:

Aktivierung:

Erkundung:

Vertiefung:

Sicherung:

Transfer:

# Hefteinträge

# Hausaufgaben

# Was lief gut / wo gab es Probleme?

# Takeaways: Was eignete sich besonders gut (Materialien, Medien, Methoden)

# Was würde ich beim nächsten mal ändern

Upload (Tafelbild, Arbeitsblätter, PPT)
`;
};

/**
 * Analysiert das Markdown-Template und extrahiert die Struktur
 */
export const parseTemplate = (templateMarkdown) => {
  const structure = [];
  const lines = templateMarkdown.split('\n');
  
  let currentSection = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Hauptüberschriften erkennen (# Titel)
    if (line.startsWith('# ')) {
      if (currentSection) {
        structure.push(currentSection);
      }
      
      currentSection = {
        title: line.substring(2).trim(),
        type: 'main',
        content: '',
        subsections: []
      };
    } 
    // Unterabschnitte erkennen (Text mit Doppelpunkt)
    else if (line.includes(':') && currentSection) {
      const [title, content] = line.split(':');
      currentSection.subsections.push({
        title: title.trim(),
        type: 'sub',
        content: content ? content.trim() : ''
      });
    }
    // Normaler Inhalt
    else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }
  
  // Letzte Sektion hinzufügen
  if (currentSection) {
    structure.push(currentSection);
  }
  
  return structure;
};