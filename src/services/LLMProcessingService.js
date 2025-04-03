import { parseTemplate } from '../utils/TemplateManager';

// Konfigurationswerte für die LLM-API
const API_URL = process.env.REACT_APP_LLM_API_URL;
const API_KEY = process.env.REACT_APP_LLM_API_KEY;

/**
 * Verarbeitet den transkribierten Text mit einem LLM und strukturiert ihn
 * gemäß dem gegebenen Template
 */
export const processTextWithLLM = async (transcription, currentMarkdown) => {
  try {
    // Template-Struktur extrahieren
    const templateStructure = parseTemplate(currentMarkdown);
    
    // Prompt für das LLM erstellen
    const prompt = createPrompt(transcription, templateStructure, currentMarkdown);
    
    // API-Aufruf zum LLM
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // oder anderes geeignetes Modell
        messages: [
          {
            role: "system",
            content: "Du bist ein Assistent, der dabei hilft, unstrukturierte Lehrerberichte in ein vorgegebenes Template zu überführen. Identifiziere relevante Informationen aus dem Transkript und ordne sie den passenden Abschnitten zu."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2
      })
    });
    
    if (!response.ok) {
      throw new Error(`LLM API Fehler: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    let content = data.choices[0].message.content;
    // Entferne ```markdown und ``` Tags
    content = content.replace(/```markdown/g, '').replace(/```/g, '');
    return content.trim();
    
  } catch (error) {
    console.error('Fehler bei der Verarbeitung mit dem LLM:', error);
    return currentMarkdown;
  }
};

/**
 * Erstellt einen Prompt für das LLM basierend auf dem Transkript und der Template-Struktur
 */
const createPrompt = (transcription, templateStructure, currentMarkdown) => {
  return `
  Ich habe folgendes Template für die Dokumentation eines Unterrichtsverlaufs:
  
  \`\`\`markdown
  ${currentMarkdown}
  \`\`\`
  
  Hier ist eine transkribierte Sprachaufzeichnung eines Lehrers, der seinen Unterricht reflektiert:
  
  \`\`\`
  ${transcription}
  \`\`\`
  
  Bitte analysiere das Transkript und fülle das Template aus. Beachte folgende Anweisungen:
  
  1. Behalte die Struktur des Templates exakt bei.
  2. Füge die relevanten Informationen aus dem Transkript an den passenden Stellen ein.
  3. Wenn für einen Abschnitt keine Informationen verfügbar sind, lasse ihn leer.
  4. Formuliere kurze, prägnante Sätze.
  5. Wenn im Template bereits Inhalte vorhanden sind, behalte diese und ergänze sie mit neuen Informationen aus dem Transkript.
  
  Gib nur den ausgefüllten Markdown-Text zurück, ohne Erklärungen.
  `;
};