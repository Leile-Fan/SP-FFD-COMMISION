import { useMemo } from 'react';
import { useImageLightbox } from '../common/ImageLightbox';

interface Props {
  content: string;
}

// Simple markdown-to-HTML renderer (no external dependency needed)
export function MarkdownRenderer({ content }: Props) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  return (
    <div
      className="text-sm leading-relaxed text-slate-700"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function renderMarkdown(md: string): string {
  let html = md;

  // Escape HTML
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />');

  // Unordered lists
  html = html.replace(/^(\s*)[-•]\s+(.+)$/gm, '<li>$2</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Ordered lists (simple: 1. 2. etc)
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Paragraphs: wrap lines that aren't already HTML tags
  html = html.replace(/^(?!<[huloci])(.+)$/gm, '<p>$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '<br />');
  html = html.replace(/\n/g, '');

  // Tables
  html = renderTables(html);

  return html;
}

function renderTables(html: string): string {
  // Simple pipe table detection
  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('|') && line.split('|').length >= 3) {
      if (!inTable) {
        inTable = true;
        tableHtml = '<table>';
      }
      const cells = line.split('|').filter((c) => c.trim());
      const isHeader = /^[\s\-:]+$/.test(cells[0] || '');
      if (!isHeader) {
        const tag = i === 0 || (i > 0 && /^[\s\-:]+$/.test(lines[i - 1]?.trim().split('|').filter((c: string) => c.trim())[0] || '')) ? 'th' : 'td';
        tableHtml += '<tr>' + cells.map((c) => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
      }
      // Check if next line continues the table
      if (i + 1 >= lines.length || !lines[i + 1].trim().includes('|')) {
        tableHtml += '</table>';
        result.push(tableHtml);
        tableHtml = '';
        inTable = false;
      }
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}
