import fs from 'fs';
import path from 'path';

export interface MarkdownFrontmatter {
  title?: string;
  slug?: string;
  date?: string;
  author?: string;
  category?: string;
  status?: string;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string;
  relatedLinks?: string[];
  image?: string;
  [key: string]: any;
}

export interface ParsedMarkdown {
  frontmatter: MarkdownFrontmatter;
  content: string;
  raw: string;
}

export function parseMarkdown(filePath: string): ParsedMarkdown {
  const raw = fs.readFileSync(filePath, 'utf-8');
  
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  let frontmatter: MarkdownFrontmatter = {};
  let content = raw;
  
  if (frontmatterMatch) {
    const frontmatterRaw = frontmatterMatch[1];
    content = frontmatterMatch[2];
    
    frontmatterRaw.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        if (value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch {
          }
        }
        
        frontmatter[key] = value;
      }
    });
  }
  
  return {
    frontmatter,
    content: content.trim(),
    raw
  };
}

export function markdownToHtml(markdown: string): string {
  let html = markdown;
  
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 15px 0; border-radius: 8px;" />');
  
  html = html.replace(/^# (.*?)(\n|$)/gm, '<h1 style="font-size: 24px; font-weight: bold; margin: 20px 0 15px; color: #333;">$1</h1>');
  html = html.replace(/^## (.*?)(\n|$)/gm, '<h2 style="font-size: 20px; font-weight: bold; margin: 15px 0 10px; color: #444;">$1</h2>');
  html = html.replace(/^### (.*?)(\n|$)/gm, '<h3 style="font-size: 18px; font-weight: bold; margin: 12px 0 8px; color: #555;">$1</h3>');
  
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold; color: #333;">$1</strong>');
  
  html = html.replace(/\n\n/g, '</p><p style="font-size: 16px; line-height: 1.6; margin: 10px 0; color: #666;">');
  html = html.replace(/\n/g, '<br/>');
  
  html = '<p style="font-size: 16px; line-height: 1.6; margin: 10px 0; color: #666;">' + html + '</p>';
  
  return html;
}
