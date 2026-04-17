#!/usr/bin/env node

const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { program } = require('commander');
const matter = require('gray-matter');

const ROOT_DIR = path.resolve(__dirname, '..');
const WIKI_DIR = path.join(ROOT_DIR, 'wiki');
const EXPLORATIONS_DIR = path.join(WIKI_DIR, 'explorations');
const LOG_PATH = path.join(WIKI_DIR, 'log.md');

async function getAllWikiPages() {
  const pages = [];
  
  async function scanDir(dir, relativePath = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await scanDir(fullPath, path.join(relativePath, entry.name));
      } else if (entry.name.endsWith('.md') && !entry.name.startsWith('.')) {
        const content = await fs.readFile(fullPath, 'utf8');
        const { data, excerpt } = matter(content, { excerpt: true });
        const pageName = entry.name.replace('.md', '');
        
        pages.push({
          name: pageName,
          path: fullPath,
          relativePath: path.join(relativePath, entry.name),
          frontmatter: data,
          content,
          excerpt: excerpt || ''
        });
      }
    }
  }
  
  await scanDir(WIKI_DIR);
  return pages;
}

function searchPages(pages, query) {
  const queryLower = query.toLowerCase();
  const results = [];
  
  for (const page of pages) {
    let score = 0;
    let matches = [];
    
    const nameMatch = page.name.toLowerCase().includes(queryLower);
    if (nameMatch) {
      score += 50;
      matches.push('页面名称');
    }
    
    if (page.frontmatter.title) {
      const titleMatch = page.frontmatter.title.toLowerCase().includes(queryLower);
      if (titleMatch) {
        score += 40;
        matches.push('标题');
      }
    }
    
    if (page.frontmatter.model) {
      const modelMatch = page.frontmatter.model.toLowerCase().includes(queryLower);
      if (modelMatch) {
        score += 45;
        matches.push('型号');
      }
    }
    
    if (page.frontmatter.keywords) {
      const keywords = Array.isArray(page.frontmatter.keywords) 
        ? page.frontmatter.keywords.join(' ') 
        : page.frontmatter.keywords;
      if (keywords.toLowerCase().includes(queryLower)) {
        score += 30;
        matches.push('关键词');
      }
    }
    
    const contentMatch = page.content.toLowerCase().includes(queryLower);
    if (contentMatch) {
      score += 20;
      matches.push('内容');
    }
    
    if (score > 0) {
      results.push({
        page,
        score,
        matches
      });
    }
  }
  
  return results.sort((a, b) => b.score - a.score);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function saveToExplorations(query, searchResults, options = {}) {
  const title = `查询: ${query}`;
  const slug = options.slug || `query-${slugify(query)}`;
  const date = new Date().toISOString().split('T')[0];
  
  try {
    await fs.mkdir(EXPLORATIONS_DIR, { recursive: true });
  } catch (e) {
    // 目录已存在，忽略
  }
  
  const relatedPages = searchResults
    .slice(0, 10)
    .map(r => `- [[${r.page.name}]] (相关性: ${r.score}, 匹配: ${r.matches.join(', ')})`)
    .join('\n');
  
  const content = `---
title: "${title}"
slug: ${slug}
type: exploration
date: ${date}
query: "${query}"
sources: ${JSON.stringify(searchResults.slice(0, 10).map(r => r.page.relativePath))}
tags: ["查询", "自动生成"]
status: draft
---

# ${title}

## 原始问题
${query}

## 搜索结果

### 相关页面
${relatedPages}

## 分析结论
（请在此处添加您的分析）

## 关键发现
（请在此处添加关键发现）

## 建议方案
（请在此处添加建议方案）
`;
  
  const filePath = path.join(EXPLORATIONS_DIR, `${slug}.md`);
  
  if (!options.force && fsSync.existsSync(filePath)) {
    console.error(`❌ Exploration 已存在: ${slug}.md`);
    console.error(`   使用 --force 参数覆盖`);
    process.exit(1);
  }
  
  await fs.writeFile(filePath, content, 'utf8');
  console.log(`\n✅ 已保存到: wiki/explorations/${slug}.md`);
  
  const logEntry = `
## [${date}] query
- 时间: ${new Date().toISOString()}
- 查询: ${query}
- 找到 ${searchResults.length} 个相关页面
- 保存到: [[${slug}]]
`;
  await fs.appendFile(LOG_PATH, logEntry, 'utf8');
}

async function queryKnowledge(query, options = {}) {
  console.log(`🔍 查询: "${query}"`);
  console.log('=' .repeat(60));
  
  const pages = await getAllWikiPages();
  const results = searchPages(pages, query);
  
  if (results.length === 0) {
    console.log('❌ 未找到相关页面');
    return;
  }
  
  console.log(`\n✅ 找到 ${results.length} 个相关页面:\n`);
  
  const topResults = results.slice(0, options.limit || 10);
  
  for (let i = 0; i < topResults.length; i++) {
    const result = topResults[i];
    const page = result.page;
    const type = page.frontmatter.type || 'unknown';
    const title = page.frontmatter.title || page.name;
    
    console.log(`${i + 1}. [[${page.name}]] - ${title}`);
    console.log(`   类型: ${type} | 相关性: ${result.score} | 匹配: ${result.matches.join(', ')}`);
    if (page.frontmatter.productLine) {
      console.log(`   产品线: ${page.frontmatter.productLine}`);
    }
    console.log('');
  }
  
  if (results.length > (options.limit || 10)) {
    console.log(`... 还有 ${results.length - (options.limit || 10)} 个结果\n`);
  }
  
  if (options.save) {
    await saveToExplorations(query, results, options);
  }
}

program
  .name('query')
  .description('查询知识库内容')
  .argument('<query>', '查询关键词')
  .option('-l, --limit <number>', '显示结果数量限制', '10')
  .option('-s, --save', '保存查询结果到 explorations/')
  .option('-f, --force', '强制覆盖已存在的 exploration')
  .option('--slug <slug>', '自定义 exploration slug')
  .action(async (query, options) => {
    try {
      await queryKnowledge(query, {
        ...options,
        limit: parseInt(options.limit)
      });
    } catch (error) {
      console.error('❌ 错误:', error.message);
      process.exit(1);
    }
  });

program.parse();
