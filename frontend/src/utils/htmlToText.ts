/**
 * Utility function to extract plain text from HTML content
 * This removes HTML tags and entities and formats the text nicely
 */
export function htmlToText(html: string): string {
  if (!html) return '';

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Remove script and style elements
  const scripts = tempDiv.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());

  // Get text content and clean it up
  let text = tempDiv.textContent || tempDiv.innerText || '';

  // Clean up whitespace
  text = text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n\n') // Replace multiple newlines with double newline
    .trim(); // Remove leading/trailing whitespace

  // Convert common HTML structures to text format
  const htmlContent = tempDiv.innerHTML;
  
  // Handle line breaks
  text = htmlContent
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<\/ol>/gi, '\n');

  // Remove all HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  const entityMap: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
  };

  text = text.replace(/&[#\w]+;/g, (entity) => {
    return entityMap[entity] || entity;
  });

  // Final cleanup
  text = text
    .replace(/\n\s+/g, '\n') // Remove spaces at beginning of lines
    .replace(/\s+\n/g, '\n') // Remove spaces at end of lines
    .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
    .trim();

  return text;
}

/**
 * Check if the provided HTML contains meaningful content
 */
export function hasHtmlContent(html: string): boolean {
  if (!html) return false;
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove script and style elements
  const scripts = tempDiv.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());
  
  const text = tempDiv.textContent || tempDiv.innerText || '';
  return text.trim().length > 0;
}
