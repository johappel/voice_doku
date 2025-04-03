import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Konvertiert Markdown zu sauberem HTML
 */
export const convertToHtml = (markdown) => {
  try {
    const html = marked.parse(markdown);
    return DOMPurify.sanitize(html);
  } catch (error) {
    console.error('Fehler bei der Markdown-Konvertierung:', error);
    return '';
  }
};

/**
 * Exportiert Markdown als Datei
 */
export const exportMarkdown = (content, filename = 'dokumentation.md') => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Erstellt eine HTML-Vorschau aus Markdown
 */
export const createPreview = (markdown) => {
  const html = convertToHtml(markdown);
  return { __html: html };
};