const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { program } = require('commander');

const {
  generateStaleReport,
  getAllWikiPages
} = require('../lib/stale-detector');
const {
  readManifest,
  writeManifest,
  findSource,
  formatDate,
  incrementVersion
} = require('../lib/manifest-manager');

const ROOT_DIR = path.join(__dirname, '..');
const WIKI_DIR = path.join(ROOT_DIR, 'wiki');
const DRAFTS_DIR = path.join(WIKI_DIR, 'drafts');
const LOG_PATH = path.join(WIKI_DIR, 'log.md');

async function ensureDraftsDir() {
  try {
    await fs.access(DRAFTS_DIR);
  } catch {
    await fs.mkdir(DRAFTS_DIR, { recursive: true });
  }
}

async function findPageByName(wikiPages, pageName) {
  const lowerName = pageName.toLowerCase();
  return wikiPages.find(p => p.name.toLowerCase() === lowerName) || null;
}

async function generateDraft(page, options = {}) {
  const draftPath = path.join(DRAFTS_DIR, `${page.name}.draft.md`);
  const timestamp = new Date().toISOString();
  
  const draftHeader = `<!-- DRAFT GENERATED: ${timestamp} -->
<!-- ORIGINAL: ${page.relativePath} -->
<!-- Use --merge to apply this draft -->

`;

  const draftContent = draftHeader + await fs.readFile(page.path, 'utf8');
  
  if (!options.dryRun) {
    await ensureDraftsDir();
    await fs.writeFile(draftPath, draftContent, 'utf8');
  }
  
  return draftPath;
}

async function mergeDraft(pageName, options = {}) {
  const wikiPages = await getAllWikiPages();
  const page = await findPageByName(wikiPages, pageName);
  
  if (!page) {
    console.error(`❌ 未找到页面: ${pageName}`);
    return false;
  }
  
  const draftPath = path.join(DRAFTS_DIR, `${pageName}.draft.md`);
  
  try {
    await fs.access(draftPath);
  } catch {
    console.error(`❌ 未找到草稿: ${draftPath}`);
    return false;
  }
  
  const draftContent = await fs.readFile(draftPath, 'utf8');
  const actualContent = draftContent.replace(/^<!--.*-->\n/gm, '');
  
  const backupPath = path.join(DRAFTS_DIR, `${pageName}.backup.${Date.now()}.md`);
  
  if (!options.dryRun) {
    await fs.copyFile(page.path, backupPath);
    await fs.writeFile(page.path, actualContent, 'utf8');
    await fs.unlink(draftPath);
    console.log(`✅ 已合并草稿: ${pageName}`);
    console.log(`   备份: ${path.relative(ROOT_DIR, backupPath)}`);
  } else {
    console.log(`[预览] 合并草稿: ${pageName}`);
  }
  
  return true;
}

async function listDrafts() {
  try {
    await fs.access(DRAFTS_DIR);
  } catch {
    console.log('ℹ️  没有草稿');
    return;
  }
  
  const files = await fs.readdir(DRAFTS_DIR);
  const draftFiles = files.filter(f => f.endsWith('.draft.md'));
  
  if (draftFiles.length === 0) {
    console.log('ℹ️  没有草稿');
    return;
  }
  
  console.log('\n📝 草稿列表:');
  for (const file of draftFiles) {
    const filePath = path.join(DRAFTS_DIR, file);
    const stats = await fs.stat(filePath);
    const pageName = path.basename(file, '.draft.md');
    console.log(`  - [[${pageName}]] (${formatDate(stats.mtime)})`);
  }
  console.log();
}

async function appendLog(action, pages) {
  const timestamp = new Date().toISOString();
  const dateStr = formatDate(new Date());
  
  let logEntry = `\n## [${dateStr}] ${action}\n`;
  logEntry += `- 时间: ${timestamp}\n`;
  
  if (pages && pages.length > 0) {
    logEntry += `- 处理页面:\n`;
    for (const page of pages) {
      logEntry += `  - [[${page}]]\n`;
    }
  }
  
  try {
    await fs.appendFile(LOG_PATH, logEntry, 'utf8');
  } catch (error) {
    console.error(`  ⚠️  无法写入日志: ${error.message}`);
  }
}

async function main(options = {}) {
  console.log('🔄 Delta Compile - 增量编译\n');
  
  if (options.list) {
    await listDrafts();
    return;
  }
  
  if (options.merge) {
    const pages = Array.isArray(options.merge) ? options.merge : [options.merge];
    for (const pageName of pages) {
      await mergeDraft(pageName, options);
    }
    return;
  }
  
  try {
    const report = await generateStaleReport();
    const wikiPages = await getAllWikiPages();
    
    let targetPages = [];
    
    if (options.pages) {
      const pageNames = options.pages.split(',').map(p => p.trim());
      for (const pageName of pageNames) {
        const page = await findPageByName(wikiPages, pageName);
        if (page) {
          targetPages.push(page);
        } else {
          console.warn(`⚠️  未找到页面: ${pageName}`);
        }
      }
    } else if (options.force) {
      targetPages = wikiPages.filter(p => 
        !p.relativePath.startsWith('index') &&
        !p.relativePath.startsWith('log') &&
        !p.relativePath.startsWith('rules')
      );
    } else {
      targetPages = report.stale_pages.map(sp => 
        findPageByName(wikiPages, sp.page)
      ).filter(Boolean);
    }
    
    if (targetPages.length === 0) {
      console.log('ℹ️  没有需要处理的页面');
      if (!options.force) {
        console.log('   使用 --force 强制处理所有页面');
        console.log('   使用 --pages <name1,name2> 指定页面');
      }
      console.log();
      return;
    }
    
    console.log(`📦 目标页面: ${targetPages.length} 个\n`);
    
    const processedPages = [];
    
    for (const page of targetPages) {
      if (options.writeDrafts) {
        const draftPath = await generateDraft(page, options);
        console.log(`✏️  ${options.dryRun ? '[预览]' : ''} 生成草稿: ${path.relative(ROOT_DIR, draftPath)}`);
        processedPages.push(page.name);
      } else {
        console.log(`⚠️  当前仅支持 --write-drafts 生成草稿模式`);
        console.log(`   草稿生成后，使用 --merge <page> 合并`);
        break;
      }
    }
    
    if (processedPages.length > 0 && !options.dryRun) {
      await appendLog(options.writeDrafts ? 'delta-compile (drafts)' : 'delta-compile', processedPages);
    }
    
    console.log();
    if (options.writeDrafts && processedPages.length > 0) {
      console.log('💡 提示:');
      console.log('   1. 查看 wiki/drafts/ 目录下的草稿');
      console.log('   2. 审核后使用 --merge <page> 合并');
      console.log('   3. 或使用 --list 查看所有草稿\n');
    }
    
  } catch (error) {
    console.error('❌ 失败:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

program
  .name('delta-compile.js')
  .description('增量编译 - 支持草稿模式和增量更新')
  .option('-d, --dry-run', '预览模式，不实际修改文件')
  .option('-w, --write-drafts', '生成草稿，不直接覆盖')
  .option('-p, --pages <list>', '指定页面 (逗号分隔)')
  .option('-f, --force', '强制处理所有页面')
  .option('-l, --list', '列出所有草稿')
  .option('-m, --merge <page>', '合并指定草稿')
  .option('-v, --verbose', '显示详细错误信息')
  .parse(process.argv);

main(program.opts());
