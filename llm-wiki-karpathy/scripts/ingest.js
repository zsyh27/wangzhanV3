/**
 * 增强版 Ingest - 智能摄入脚本
 * 
 * ⚠️  当前推荐使用方式：直接使用 Trae AI 处理 PDF，而不是运行此脚本
 * 
 * 为什么使用 Trae AI 而不是 Moonshot API：
 * 1. 免费：Trae AI 提供免费的大模型调用，无需额外费用
 * 2. 更灵活：Trae AI 可以理解项目上下文，直接处理和生成文件
 * 3. 更易用：直接对话即可，无需配置 API Key 和编写脚本
 * 
 * 后期如何切换回 Moonshot API：
 * 1. 确保 .env 中配置了 MOONSHOT_API_KEY
 * 2. 直接运行此脚本：node scripts/ingest.js
 * 3. 脚本会自动调用 Moonshot API 处理 PDF
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const pdfParse = require('pdf-parse');
const { program } = require('commander');
const { spawn } = require('child_process');
const matter = require('gray-matter');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const {
  readManifest,
  writeManifest,
  findSource,
  addSource,
  updateSource,
  updateManifestStatus,
  scanRawDirectory,
  calculateMD5,
  detectType,
  formatDate,
  incrementVersion,
  RAW_DIR,
  MANIFEST_PATH
} = require('../lib/manifest-manager');

const { getMoonshotConfig } = require('../../lib/config');
const { parseAIResponse } = require('../../lib/ai-json-cleaner');

const ROOT_DIR = path.join(__dirname, '..');
const WIKI_DIR = path.join(ROOT_DIR, 'wiki');
const LOG_PATH = path.join(WIKI_DIR, 'log.md');

const moonshotConfig = getMoonshotConfig();
const MOONSHOT_API_KEY = moonshotConfig.apiKey;

const REPORT = {
  scanned: 0,
  added: 0,
  updated: 0,
  processed: 0,
  errors: 0,
  wikiPages: []
};

async function updateIndex() {
  return new Promise((resolve, reject) => {
    const updateIndexPath = path.join(__dirname, 'update-index.js');
    const child = spawn('node', [updateIndexPath], {
      cwd: ROOT_DIR,
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`update-index.js 退出码: ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

function callMoonshotAPI(prompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'moonshot-v1-128k',
      messages: [
        {
          role: 'system',
          content: '你是湖北科信达机电设备有限公司的专业技术工程师，擅长分析霍尼韦尔阀门产品手册，提取产品信息，生成结构化的知识库页面。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const options = {
      hostname: 'api.moonshot.cn',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response);
          }
        } catch (error) {
          reject(new Error('解析API响应失败'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

function generateIngestPrompt(pdfContent) {
  const prompt = `请分析以下霍尼韦尔阀门产品手册的完整内容，提取所有产品信息和技术主题，生成结构化的知识库页面。

产品手册完整内容：
${pdfContent}

请按照以下要求返回JSON格式，只返回JSON，不要任何其他文字：

{
  "entities": [
    {
      "slug": "v5011b2w",
      "model": "V5011B2W",
      "title": "霍尼韦尔 V5011B2W 系列螺纹型电动座阀",
      "brand": "霍尼韦尔",
      "productLine": "座阀",
      "productType": "电动座阀",
      "mediaType": "冷热水",
      "relatedEntities": ["v5011b3w", "v5011s2w", "ml74"],
      "relatedTopics": ["valve-selection"],
      "content": "完整的产品介绍，使用[[PageName]]格式引用相关页面"
    }
  ],
  "topics": [
    {
      "slug": "valve-selection",
      "title": "电动阀门选型指南",
      "tags": ["选型指南", "电动阀门"],
      "relatedEntities": ["v5011b2w", "v5gv2w", "ml74"],
      "relatedTopics": [],
      "content": "完整的选型指南，使用[[PageName]]格式引用相关页面"
    }
  ]
}

重要要求：
1. entities 数组包含所有产品实体页面
2. topics 数组包含所有技术主题页面
3. relatedEntities 和 relatedTopics 用于建立双向链接
4. content 中使用 [[PageName]] 格式引用相关页面
5. 确保所有 slug 都是小写，使用连字符分隔
6. 确保返回完整有效的JSON，不要截断
7. 只返回JSON，不要任何其他说明文字`;

  return prompt;
}

async function readPDFContent(filePath) {
  const dataBuffer = require('fs').readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

async function readSourceContent(sourceEntry) {
  const filePath = path.join(RAW_DIR, sourceEntry.filename);
  
  if (sourceEntry.type === 'pdf') {
    return await readPDFContent(filePath);
  }
  
  return await fs.readFile(filePath, 'utf8');
}

async function writeEntityPage(entity, sourceFilename, options = {}) {
  const frontmatter = {
    title: entity.title,
    slug: entity.slug,
    date: new Date().toISOString(),
    author: '湖北科信达机电设备有限公司技术部',
    category: entity.productLine,
    status: 'published',
    seoTitle: `${entity.model}_${entity.productType}_产品参数_湖北科信达`,
    seoDescription: `湖北科信达为您详细介绍${entity.title}技术参数、特点及应用，霍尼韦尔阀门湖北官方授权代理商，正品保障。`,
    keywords: `${entity.brand}阀门,${entity.model},${entity.productType},产品参数,湖北科信达`,
    relatedLinks: ['/selection-guide', '/contact'],
    model: entity.model,
    brand: entity.brand,
    type: 'entity',
    productLine: entity.productLine,
    productType: entity.productType,
    mediaType: entity.mediaType,
    relatedEntities: entity.relatedEntities || [],
    relatedTopics: entity.relatedTopics || [],
    sources: [sourceFilename]
  };

  const fullContent = matter.stringify(entity.content, frontmatter);
  const outputPath = path.join(WIKI_DIR, 'entities', `${entity.slug}.md`);
  
  if (!options.dryRun) {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, fullContent, 'utf8');
  }
  
  console.log(`  📄 ${options.dryRun ? '[预览]' : ''} 生成实体页: entities/${entity.slug}.md`);
  return `entities/${entity.slug}.md`;
}

async function writeTopicPage(topic, sourceFilename, options = {}) {
  const frontmatter = {
    title: topic.title,
    slug: topic.slug,
    date: new Date().toISOString(),
    author: '湖北科信达机电设备有限公司技术部',
    category: 'selection-guide',
    status: 'published',
    seoTitle: `${topic.title}_技术文章_湖北科信达`,
    seoDescription: `湖北科信达为您带来${topic.title}的专业技术指南，霍尼韦尔阀门湖北官方授权代理商。`,
    keywords: `${topic.title},霍尼韦尔阀门,技术指南,湖北科信达`,
    relatedLinks: ['/products', '/contact'],
    type: 'topic',
    tags: topic.tags || [],
    relatedEntities: topic.relatedEntities || [],
    relatedTopics: topic.relatedTopics || [],
    sources: [sourceFilename]
  };

  const fullContent = matter.stringify(topic.content, frontmatter);
  const outputPath = path.join(WIKI_DIR, 'topics', `${topic.slug}.md`);
  
  if (!options.dryRun) {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, fullContent, 'utf8');
  }
  
  console.log(`  📄 ${options.dryRun ? '[预览]' : ''} 生成主题页: topics/${topic.slug}.md`);
  return `topics/${topic.slug}.md`;
}

function generateSourceSummary(sourceEntry, content) {
  const filename = path.basename(sourceEntry.filename, path.extname(sourceEntry.filename));
  const slug = filename.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
  
  const frontmatter = `---
title: "${filename}"
sourceType: ${sourceEntry.type}
sourcePath: ../raw/${sourceEntry.filename}
date: ${formatDate(new Date())}
---
`;

  const contentPreview = content.substring(0, 2000).replace(/\r/g, '');
  
  return {
    slug,
    filename: `${slug}.md`,
    content: `${frontmatter}
# ${filename}

## 来源信息
- **文档名称**：${filename}
- **文档类型**：${sourceEntry.type === 'pdf' ? 'PDF 文档' : sourceEntry.type}
- **文件路径**：${sourceEntry.filename}

## 内容摘要
\`\`\`
${contentPreview}
...
\`\`\`

## 相关页面
（待补充）
`
  };
}

async function writeWikiPages(sourceEntry, content, options = {}) {
  const wikiPages = [];
  
  const summary = generateSourceSummary(sourceEntry, content);
  const sourcePagePath = path.join(WIKI_DIR, 'sources', summary.filename);
  
  if (!options.dryRun) {
    await fs.mkdir(path.dirname(sourcePagePath), { recursive: true });
    await fs.writeFile(sourcePagePath, summary.content, 'utf8');
  }
  
  wikiPages.push(`sources/${summary.filename}`);
  console.log(`  📄 ${options.dryRun ? '[预览]' : ''} 生成素材摘要: sources/${summary.filename}`);
  
  if (MOONSHOT_API_KEY && MOONSHOT_API_KEY !== 'YOUR_MOONSHOT_API_KEY') {
    console.log(`  🤖 调用 Moonshot API 分析完整 PDF 内容...`);
    
    try {
      const prompt = generateIngestPrompt(content);
      const response = await callMoonshotAPI(prompt);
      const aiContent = response.choices[0].message.content;
      
      console.log(`  ✅ API 响应成功，解析中...`);
      
      const parsedResult = parseAIResponse(aiContent, { verbose: true, enableCommonFixes: true });
      
      if (parsedResult.entities && Array.isArray(parsedResult.entities)) {
        for (const entity of parsedResult.entities) {
          const pagePath = await writeEntityPage(entity, sourceEntry.filename, options);
          wikiPages.push(pagePath);
        }
      }
      
      if (parsedResult.topics && Array.isArray(parsedResult.topics)) {
        for (const topic of parsedResult.topics) {
          const pagePath = await writeTopicPage(topic, sourceEntry.filename, options);
          wikiPages.push(pagePath);
        }
      }
      
    } catch (error) {
      console.error(`  ⚠️  LLM 处理失败: ${error.message}`);
      console.log(`  ℹ️  仅生成素材摘要页`);
    }
  } else {
    console.log(`  ℹ️  未配置 Moonshot API Key，仅生成素材摘要页`);
  }
  
  return wikiPages;
}

async function appendLog(action, source, wikiPages) {
  const timestamp = new Date().toISOString();
  const dateStr = formatDate(new Date());
  
  let logEntry = `\n## [${dateStr}] ${action} | ${source}\n`;
  logEntry += `- 时间: ${timestamp}\n`;
  
  if (wikiPages && wikiPages.length > 0) {
    logEntry += `- 生成页面:\n`;
    for (const page of wikiPages) {
      const pageName = path.basename(page, '.md');
      logEntry += `  - [[${pageName}]]\n`;
    }
  }
  
  try {
    await fs.appendFile(LOG_PATH, logEntry, 'utf8');
  } catch (error) {
    console.error(`  ⚠️  无法写入日志: ${error.message}`);
  }
}

async function scanAndUpdateManifest(options = {}) {
  console.log('📋 扫描 raw/ 目录...');
  
  const rawFiles = await scanRawDirectory();
  const manifest = await readManifest();
  
  REPORT.scanned = rawFiles.length;
  
  for (const file of rawFiles) {
    const existing = findSource(manifest, file.name);
    const checkSum = await calculateMD5(file.path);
    
    if (!existing) {
      console.log(`  ➕ 新素材: ${file.name}`);
      addSource(manifest, {
        filename: file.name,
        date_modified: file.mtime,
        check_sum: checkSum
      });
      REPORT.added++;
    } else if (existing.check_sum !== checkSum) {
      console.log(`  🔄 素材已更新: ${file.name}`);
      updateSource(manifest, file.name, {
        date_modified: file.mtime,
        status: 'pending',
        check_sum: checkSum
      });
      REPORT.updated++;
    }
  }
  
  await writeManifest(manifest);
  console.log(`✅ 清单更新完成: 扫描 ${REPORT.scanned} 个, 新增 ${REPORT.added} 个, 更新 ${REPORT.updated} 个`);
  
  return manifest;
}

async function getPendingSources(manifest, options = {}) {
  let sources = manifest.filter(item => item.status === 'pending');
  
  if (options.source) {
    sources = sources.filter(item => item.filename === options.source);
    if (sources.length === 0) {
      const source = findSource(manifest, options.source);
      if (source) {
        if (options.force) {
          source.status = 'pending';
          sources = [source];
          console.log(`⚠️  强制重新处理: ${options.source}`);
        } else {
          console.log(`ℹ️  素材已处理，使用 --force 强制重新处理`);
        }
      } else {
        console.log(`❌ 未找到素材: ${options.source}`);
      }
    }
  }
  
  return sources;
}

async function processSource(sourceEntry, manifest, options = {}) {
  console.log(`\n🔄 处理素材: ${sourceEntry.filename}`);
  
  try {
    updateSource(manifest, sourceEntry.filename, { status: 'processing' });
    await writeManifest(manifest);
    
    const content = await readSourceContent(sourceEntry);
    console.log(`  ✅ 读取内容: ${content.length} 字符`);
    
    const wikiPages = await writeWikiPages(sourceEntry, content, options);
    REPORT.wikiPages.push(...wikiPages);
    
    const version = incrementVersion(sourceEntry.version);
    updateSource(manifest, sourceEntry.filename, {
      status: 'processed',
      processed_date: formatDate(new Date()),
      version,
      wiki_pages: wikiPages.join(',')
    });
    await writeManifest(manifest);
    
    await appendLog('ingest', sourceEntry.filename, wikiPages);
    
    REPORT.processed++;
    console.log(`  ✅ 处理完成`);
    
  } catch (error) {
    updateSource(manifest, sourceEntry.filename, { status: 'error' });
    await writeManifest(manifest);
    
    REPORT.errors++;
    console.error(`  ❌ 处理失败: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
  }
}

function generateReport() {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 处理报告');
  console.log('─'.repeat(60));
  console.log(`扫描素材: ${REPORT.scanned}`);
  console.log(`新增素材: ${REPORT.added}`);
  console.log(`更新素材: ${REPORT.updated}`);
  console.log(`处理完成: ${REPORT.processed}`);
  console.log(`处理失败: ${REPORT.errors}`);
  
  if (REPORT.wikiPages.length > 0) {
    console.log(`\n生成的 wiki 页面:`);
    for (const page of REPORT.wikiPages) {
      console.log(`  - ${page}`);
    }
  }
  console.log('═'.repeat(60));
}

async function main(options = {}) {
  console.log('🚀 增强版 Ingest - 智能摄入脚本\n');
  
  if (options.dryRun) {
    console.log('⚠️  预览模式：不会实际修改文件\n');
  }
  
  try {
    const manifest = await scanAndUpdateManifest(options);
    
    const pendingSources = await getPendingSources(manifest, options);
    
    if (pendingSources.length === 0) {
      console.log('ℹ️  没有待处理的素材');
      generateReport();
      return;
    }
    
    console.log(`\n📦 待处理素材: ${pendingSources.length} 个`);
    
    for (const source of pendingSources) {
      await processSource(source, manifest, options);
    }
    
    generateReport();
    
    if (!options.dryRun && REPORT.wikiPages.length > 0) {
      console.log('\n📚 自动更新索引...');
      await updateIndex();
    }
    
  } catch (error) {
    console.error('\n❌ 致命错误:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

program
  .name('ingest.js')
  .description('增强版智能摄入脚本 - 处理 raw/ 素材并生成 wiki/ 内容')
  .option('-s, --source <path>', '指定单个素材处理 (相对于 raw/)')
  .option('-d, --dry-run', '预览模式，不实际修改文件')
  .option('-f, --force', '强制重新处理已处理的素材')
  .option('-v, --verbose', '显示详细错误信息')
  .parse(process.argv);

main(program.opts());
