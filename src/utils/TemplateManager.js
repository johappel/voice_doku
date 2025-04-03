import yaml from 'js-yaml';

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
 * Lädt alle verfügbaren Templates aus dem /templates/-Verzeichnis
 */
export const loadAllTemplates = async () => {
  try {
    const response = await fetch('/templates/list.json');
    if (!response.ok) throw new Error('Failed to fetch templates');
    
    const templates = await response.json();
    return templates.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description
    }));
  } catch (error) {
    console.error('Error loading templates:', error);
    return [];
  }
};

/**
 * Lädt ein spezifisches Template
 */
export const loadTemplate = async (templateId) => {
  try {
    const response = await fetch(`/templates/${templateId}.md`);
    if (!response.ok) throw new Error('Template not found');
    
    const template = await response.json();
    return {
      id: template.id,
      name: template.name,
      content: template.content,
      systemPrompt: template.systemPrompt,
      userPrompt: template.userPrompt
    };
  } catch (error) {
    console.error('Error loading template:', error);
    throw error;
  }
};

/**
 * Validiert eine Template-YAML-Datei
 */
export const validateTemplate = (yamlContent) => {
  try {
    const metaMatch = yamlContent.match(/<!--\s*TEMPLATE_META\s*([\s\S]*?)\s*-->/);
    if (!metaMatch) throw new Error('Missing TEMPLATE_META section');
    
    const metaContent = metaMatch[1].trim();
    if (!metaContent.includes('title:')) throw new Error('Missing title in TEMPLATE_META');
    if (!metaContent.includes('system_prompt:')) throw new Error('Missing system_prompt in TEMPLATE_META');
    if (!metaContent.includes('user_prompt:')) throw new Error('Missing user_prompt in TEMPLATE_META');
    
    return true;
  } catch (error) {
    console.error('Template validation failed:', error);
    return false;
  }
};

/**
 * Konvertiert ein Markdown-Template in die YAML-Struktur
 */
export const convertToYamlTemplate = (markdownContent) => {
  const sections = parseTemplate(markdownContent);
  const yamlTemplate = {
    title: sections[0]?.title || 'Unbekannt',
    systemPrompt: 'KI-Systeminstruktionen hier einfügen',
    userPrompt: 'Benutzer-Eingabeaufforderung hier einfügen',
    contentTemplate: markdownContent
  };
  return yaml.dump(yamlTemplate);
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