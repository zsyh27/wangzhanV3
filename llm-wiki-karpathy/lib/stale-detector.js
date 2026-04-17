const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT_DIR = path.join(__dirname, '..');
const WIKI_DIR = path.join(ROOT_DIR, 'wiki');
const RAW_DIR = path.join(ROOT_DIR, 'raw');

const { readManifest, findSource, formatDate } = require('./manifest-manager');

async function getAllWikiPages() {
  const pages = [];
  
  async function scan(dir, baseDir = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(baseDir, entry.name);
      
      if (entry.isDirectory()) {
        await scan(fullPath, relPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const stats = await fs.stat(fullPath);
        const content = await fs.readFile(fullPath, 'utf8');
        const parsed = matter(content);
        
        pages.push({
          name: path.basename(entry.name, '.md'),
          path: fullPath,
          relativePath: relPath.replace(/\\/g, '/'),
          mtime: stats.mtime,
          frontmatter: parsed.data,
          content: parsed.content
        });
      }
    }
  }
  
  await scan(WIKI_DIR);
  return pages;
}

function extractLinks(content) {
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1].toLowerCase());
  }
  
  return links;
}

async function findStalePages(wikiPages, manifest) {
  const stalePages = [];
  
  for (const page of wikiPages) {
    const sources = page.frontmatter.sources || [];
    
    for (const sourceFile of sources) {
      const sourceEntry = findSource(manifest, sourceFile);
      
      if (sourceEntry && sourceEntry.date_modified) {
        const sourceMTime = new Date(sourceEntry.date_modified);
        
        if (sourceMTime > page.mtime) {
          stalePages.push({
            page: page.name,
            page_path: page.relativePath,
            source: sourceFile,
            source_updated: sourceEntry.date_modified,
            page_updated: page.mtime.toISOString(),
            stale_days: Math.floor((Date.now() - page.mtime) / (1000 * 60 * 60 * 24)),
            impact: calculateImpact(page, wikiPages)
          });
        }
      }
    }
  }
  
  return stalePages;
}

function calculateImpact(page, allPages) {
  const pageLinks = extractLinks(page.content);
  const linkedFrom = [];
  
  for (const otherPage of allPages) {
    if (otherPage.name !== page.name) {
      const otherLinks = extractLinks(otherPage.content);
      if (otherLinks.includes(page.name.toLowerCase())) {
        linkedFrom.push(otherPage.name);
      }
    }
  }
  
  const level = linkedFrom.length > 5 ? 'high' : linkedFrom.length > 2 ? 'medium' : 'low';
  
  return {
    level,
    linked_pages: linkedFrom,
    reason: level === 'high' ? '高影响页面，多个页面引用' : 
            level === 'medium' ? '中等影响页面' : '低影响页面'
  };
}

function findOrphanedPages(wikiPages) {
  const pageNames = wikiPages.map(p => p.name.toLowerCase());
  const orphaned = [];
  
  for (const page of wikiPages) {
    let hasIncomingLink = false;
    
    for (const otherPage of wikiPages) {
      if (otherPage.name !== page.name) {
        const links = extractLinks(otherPage.content);
        if (links.includes(page.name.toLowerCase())) {
          hasIncomingLink = true;
          break;
        }
      }
    }
    
    if (!hasIncomingLink && !page.relativePath.startsWith('index') && 
        !page.relativePath.startsWith('log') && 
        !page.relativePath.startsWith('rules') &&
        !page.relativePath.startsWith('sources/')) {
      orphaned.push({
        page: page.name,
        page_path: page.relativePath
      });
    }
  }
  
  return orphaned;
}

function findBrokenLinks(wikiPages) {
  const brokenLinks = [];
  const pageNames = wikiPages.map(p => p.name.toLowerCase());
  
  for (const page of wikiPages) {
    const links = extractLinks(page.content);
    
    for (const link of links) {
      if (!pageNames.includes(link)) {
        brokenLinks.push({
          from_page: page.name,
          from_page_path: page.relativePath,
          broken_link: link
        });
      }
    }
  }
  
  return brokenLinks;
}

function generateRecommendations(report) {
  const recommendations = [];
  
  for (const stalePage of report.stale_pages) {
    recommendations.push({
      priority: stalePage.impact.level,
      action: 'recompile',
      target: stalePage.page,
      reason: `基于已更新的素材: ${stalePage.source}`,
      suggested_command: `node scripts/delta-compile.js --pages ${stalePage.page}`
    });
  }
  
  for (const orphanedPage of report.orphaned_pages) {
    recommendations.push({
      priority: 'low',
      action: 'review',
      target: orphanedPage.page,
      reason: '孤立页面，无入链',
      suggested_command: `观察并决定是否需要链接或删除`
    });
  }
  
  for (const brokenLink of report.broken_links) {
    recommendations.push({
      priority: 'medium',
      action: 'fix',
      target: brokenLink.from_page,
      reason: `断链: [[${brokenLink.broken_link}]]`,
      suggested_command: `修复或创建页面`
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

async function generateStaleReport() {
  const wikiPages = await getAllWikiPages();
  const manifest = await readManifest();
  
  const stalePages = await findStalePages(wikiPages, manifest);
  const orphanedPages = findOrphanedPages(wikiPages);
  const brokenLinks = findBrokenLinks(wikiPages);
  
  const report = {
    generated_at: new Date().toISOString(),
    summary: {
      total_wiki_pages: wikiPages.length,
      stale_pages: stalePages.length,
      orphaned_pages: orphanedPages.length,
      broken_links: brokenLinks.length
    },
    stale_pages: stalePages,
    orphaned_pages: orphanedPages,
    broken_links: brokenLinks,
    recommendations: []
  };
  
  report.recommendations = generateRecommendations(report);
  
  return report;
}

function formatReportAsMarkdown(report) {
  let md = `# 知识库陈旧内容报告\n\n`;
  md += `生成时间: ${report.generated_at}\n\n`;
  
  md += `## 摘要\n\n`;
  md += `- 总页面数: ${report.summary.total_wiki_pages}\n`;
  md += `- 陈旧页面: ${report.summary.stale_pages}\n`;
  md += `- 孤立页面: ${report.summary.orphaned_pages}\n`;
  md += `- 断链: ${report.summary.broken_links}\n\n`;
  
  if (report.stale_pages.length > 0) {
    md += `## 陈旧页面\n\n`;
    for (const page of report.stale_pages) {
      md += `### [[${page.page}]]\n`;
      md += `- 页面路径: ${page.page_path}\n`;
      md += `- 来源素材: ${page.source}\n`;
      md += `- 素材更新时间: ${page.source_updated}\n`;
      md += `- 页面更新时间: ${page.page_updated}\n`;
      md += `- 陈旧天数: ${page.stale_days}\n`;
      md += `- 影响级别: ${page.impact.level}\n`;
      md += `- 引用页面: ${page.impact.linked_pages.join(', ')}\n\n`;
    }
  }
  
  if (report.orphaned_pages.length > 0) {
    md += `## 孤立页面\n\n`;
    for (const page of report.orphaned_pages) {
      md += `- [[${page.page}]] - ${page.page_path}\n`;
    }
    md += `\n`;
  }
  
  if (report.broken_links.length > 0) {
    md += `## 断链\n\n`;
    for (const link of report.broken_links) {
      md += `- [[${link.from_page}]] → [[${link.broken_link}]]\n`;
    }
    md += `\n`;
  }
  
  if (report.recommendations.length > 0) {
    md += `## 建议操作\n\n`;
    for (const rec of report.recommendations) {
      md += `### [${rec.priority.toUpperCase()}] ${rec.action} - ${rec.target}\n`;
      md += `- 原因: ${rec.reason}\n`;
      md += `- 建议: ${rec.suggested_command}\n\n`;
    }
  }
  
  return md;
}

module.exports = {
  getAllWikiPages,
  findStalePages,
  findOrphanedPages,
  findBrokenLinks,
  calculateImpact,
  generateStaleReport,
  formatReportAsMarkdown
};
