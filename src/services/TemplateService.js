// import yaml from 'js-yaml';  // Currently unused

/**
 * API Service für Template-Operationen
 */
export class TemplateService {
  /**
   * Lädt alle verfügbaren Templates vom Server
   */
  static async getAllTemplates() {
    try {
      const response = await fetch('/templates/list.json');
      if (!response.ok) throw new Error('Template list not found');
      return await response.json();

      // TODO: Uncomment for production
      // const response = await fetch('/templates');
      // if (!response.ok) throw new Error('Failed to fetch templates');
      // return await response.json();
    } catch (error) {
      console.error('Error loading templates:', error);
      throw error;
    }
  }

  /**
   * Lädt ein spezifisches Template vom Server
   */
  static async getTemplateById(templateId) {
    try {
      // Debug logging
      // Entferne .md falls bereits vorhanden
      const cleanTemplateId = templateId.endsWith('.md') ? templateId.slice(0, -3) : templateId;
      console.log(`Loading template: ${cleanTemplateId}.md`);
      
      const response = await fetch(`/templates/${cleanTemplateId}.md`);
      if (!response.ok) {
        console.error(`Template load failed: ${response.status}`);
        throw new Error('Template not found');
      }
      
      const content = await response.text();
      const metaMatch = content.match(/<!--\s*TEMPLATE_META\s*([\s\S]*?)\s*-->/);
      
      if (!metaMatch) {
        console.error('Template content:', content);
        throw new Error('Missing TEMPLATE_META section');
      }
      
      const metaContent = metaMatch[1].trim();
      console.log('Meta content:', metaContent);
      const titleMatch = metaContent.match(/title:\s*(.*)/);
      const systemPromptMatch = metaContent.match(/system_prompt:\s*\|([\s\S]*?)(?=\n\w|$)/);
      const userPromptMatch = metaContent.match(/user_prompt:\s*\|([\s\S]*?)(?=\n\w|$)/);
      
      if (!titleMatch || !systemPromptMatch || !userPromptMatch) {
        throw new Error('Missing required metadata in TEMPLATE_META');
      }
      
      const templateContent = content.replace(metaMatch[0], '').trim();
      
      return {
        id: templateId,
        name: templateId.split('_')[1]?.replace('.md', '') || templateId,
        content: templateContent,
        systemPrompt: systemPromptMatch[1].trim(),
        userPrompt: userPromptMatch[1].trim(),
        title: titleMatch[1].trim()
      };
    } catch (error) {
      console.error('Error loading template:', error);
      throw new Error(`Template loading failed: ${error.message}`);
    }
  }

  /**
   * Validiert ein Template
   */
  static validateTemplate(template) {
    try {
      if (!template.title) throw new Error('Missing title section');
      if (!template.systemPrompt) throw new Error('Missing systemPrompt section');
      if (!template.userPrompt) throw new Error('Missing userPrompt section');
      if (!template.contentTemplate) throw new Error('Missing contentTemplate section');
      return true;
    } catch (error) {
      console.error('Template validation failed:', error);
      return false;
    }
  }

  /**
   * Speichert ein neues Template auf dem Server
   */
  static async saveTemplate(templateData) {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });
      
      if (!response.ok) throw new Error('Failed to save template');
      return await response.json();
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  }
}