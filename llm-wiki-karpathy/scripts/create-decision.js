#!/usr/bin/env node

const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { program } = require('commander');

const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');
const WIKI_DIR = path.join(ROOT_DIR, 'wiki');
const DECISIONS_DIR = path.join(WIKI_DIR, 'decisions');
const LOG_PATH = path.join(WIKI_DIR, 'log.md');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function readTemplate(templateName) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.md`);
  return fs.readFile(templatePath, 'utf8');
}

function fillTemplate(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

async function appendLog(action, details) {
  const timestamp = new Date().toISOString();
  const logEntry = `
## [${new Date().toISOString().split('T')[0]}] ${action}
- 时间: ${timestamp}
${details.map(d => `- ${d}`).join('\n')}
`;
  await fs.appendFile(LOG_PATH, logEntry, 'utf8');
}

async function createDecision(title, options = {}) {
  const slug = options.slug || slugify(title);
  const date = new Date().toISOString().split('T')[0];
  
  try {
    await fs.mkdir(DECISIONS_DIR, { recursive: true });
  } catch (e) {
    // 目录已存在，忽略
  }
  
  const template = await readTemplate('decision');
  const content = fillTemplate(template, {
    title,
    slug,
    date
  });
  
  const filePath = path.join(DECISIONS_DIR, `${slug}.md`);
  
  if (!options.force && fsSync.existsSync(filePath)) {
    console.error(`❌ Decision 已存在: ${slug}.md`);
    console.error(`   使用 --force 参数覆盖`);
    process.exit(1);
  }
  
  if (options.dryRun) {
    console.log(`📝 预览模式：不会实际创建文件`);
    console.log(`\n内容预览:\n${content}\n`);
    console.log(`文件路径: ${filePath}`);
    return;
  }
  
  await fs.writeFile(filePath, content, 'utf8');
  console.log(`✅ Decision 已创建: wiki/decisions/${slug}.md`);
  
  await appendLog('create-decision', [
    `标题: ${title}`,
    `页面: [[${slug}]]`,
    `状态: ${options.status || 'proposed'}`
  ]);
  
  return filePath;
}

program
  .name('create-decision')
  .description('创建一个新的 Decision 页面')
  .argument('<title>', 'Decision 标题')
  .option('-s, --slug <slug>', '自定义 slug（默认从标题生成）')
  .option('-f, --force', '强制覆盖已存在的页面')
  .option('-n, --dry-run', '预览模式，不实际创建文件')
  .option('--status <status>', '初始状态（proposed|accepted|rejected）', 'proposed')
  .action(async (title, options) => {
    try {
      await createDecision(title, options);
    } catch (error) {
      console.error('❌ 错误:', error.message);
      process.exit(1);
    }
  });

program.parse();
