const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { program } = require('commander');
const matter = require('gray-matter');

const {
  getAllWikiPages,
  findStalePages,
  findOrphanedPages,
  findBrokenLinks
} = require('../lib/stale-detector');
const { readManifest } = require('../lib/manifest-manager');

const ROOT_DIR = path.join(__dirname, '..');

function checkFrontmatter(page) {
  const issues = [];
  const fm = page.frontmatter;
  const relPath = page.relativePath;

  if (relPath.startsWith('entities/')) {
    if (!fm.model) issues.push('缺少 model 字段');
    if (!fm.brand) issues.push('缺少 brand 字段');
    if (!fm.productLine) issues.push('缺少 productLine 字段');
  } else if (relPath.startsWith('topics/')) {
    if (!fm.tags) issues.push('缺少 tags 字段');
  }

  if (!fm.title) issues.push('缺少 title 字段');

  return issues;
}

function checkDataConsistency(pages) {
  const issues = [];
  const models = {};

  for (const page of pages) {
    if (page.relativePath.startsWith('entities/') && page.frontmatter.model) {
      const model = page.frontmatter.model.toLowerCase();
      if (models[model]) {
        issues.push({
          page: page.name,
          issue: `型号重复: ${page.frontmatter.model} (已在 ${models[model]} 中定义)`
        });
      } else {
        models[model] = page.name;
      }
    }
  }

  return issues;
}

async function autoFixFrontmatter(page) {
  const fm = page.frontmatter;
  const relPath = page.relativePath;
  const fixes = [];

  if (relPath.startsWith('entities/')) {
    if (!fm.type) {
      fm.type = 'entity';
      fixes.push('添加 type: entity');
    }
    if (!fm.model) {
      fm.model = page.name.toUpperCase();
      fixes.push(`添加 model: ${fm.model}`);
    }
    if (!fm.brand) {
      fm.brand = '霍尼韦尔';
      fixes.push('添加 brand: 霍尼韦尔');
    }
    if (!fm.productLine) {
      fm.productLine = '未知';
      fixes.push('添加 productLine: 未知');
    }
    if (!fm.productType) {
      fm.productType = '未知';
      fixes.push('添加 productType: 未知');
    }
    if (!fm.mediaType) {
      fm.mediaType = '冷热水';
      fixes.push('添加 mediaType: 冷热水');
    }
    if (!fm.relatedEntities) {
      fm.relatedEntities = [];
      fixes.push('添加 relatedEntities: []');
    }
    if (!fm.relatedTopics) {
      fm.relatedTopics = [];
      fixes.push('添加 relatedTopics: []');
    }
    if (!fm.sources) {
      fm.sources = [];
      fixes.push('添加 sources: []');
    }
  } else if (relPath.startsWith('topics/')) {
    if (!fm.type) {
      fm.type = 'topic';
      fixes.push('添加 type: topic');
    }
    if (!fm.tags) {
      fm.tags = [];
      fixes.push('添加 tags: []');
    }
  }

  if (!fm.title) {
    fm.title = page.name;
    fixes.push(`添加 title: ${fm.title}`);
  }

  if (fixes.length > 0) {
    const filePath = path.join(ROOT_DIR, 'wiki', relPath);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const doc = matter(fileContent);
    
    doc.data = { ...doc.data, ...fm };
    
    const newContent = matter.stringify(doc.content, doc.data);
    await fs.writeFile(filePath, newContent, 'utf8');
    
    return fixes;
  }

  return [];
}

async function autoFixAll(pages, options = {}) {
  const fixResults = [];

  for (const page of pages) {
    const fmIssues = checkFrontmatter(page);
    if (fmIssues.length > 0) {
      if (!options.dryRun) {
        const fixes = await autoFixFrontmatter(page);
        if (fixes.length > 0) {
          fixResults.push({
            page: page.name,
            page_path: page.relativePath,
            fixes
          });
        }
      } else {
        fixResults.push({
          page: page.name,
          page_path: page.relativePath,
          fixes: fmIssues.map(i => `将修复: ${i}`)
        });
      }
    }
  }

  return fixResults;
}

async function generateLintReport() {
  const pages = await getAllWikiPages();
  const manifest = await readManifest();
  const stalePages = await findStalePages(pages, manifest);
  const orphanedPages = findOrphanedPages(pages);
  const brokenLinks = findBrokenLinks(pages);

  const report = {
    generated_at: new Date().toISOString(),
    summary: {
      total_pages: pages.length,
      frontmatter_issues: 0,
      stale_pages: stalePages.length,
      orphaned_pages: orphanedPages.length,
      broken_links: brokenLinks.length,
      data_consistency_issues: 0
    },
    frontmatter_issues: [],
    stale_pages: stalePages,
    orphaned_pages: orphanedPages,
    broken_links: brokenLinks,
    data_consistency_issues: []
  };

  for (const page of pages) {
    const issues = checkFrontmatter(page);
    if (issues.length > 0) {
      report.frontmatter_issues.push({
        page: page.name,
        page_path: page.relativePath,
        issues
      });
      report.summary.frontmatter_issues += issues.length;
    }
  }

  report.data_consistency_issues = checkDataConsistency(pages);
  report.summary.data_consistency_issues = report.data_consistency_issues.length;

  return report;
}

function printColoredReport(report) {
  console.log('\n' + '═'.repeat(60));
  console.log('🔍 知识库健康检查报告');
  console.log('─'.repeat(60));
  console.log(`生成时间: ${report.generated_at}\n`);

  console.log('摘要:');
  console.log(`  总页面数: ${report.summary.total_pages}`);
  
  const fmColor = report.summary.frontmatter_issues > 0 ? '\x1b[33m' : '\x1b[32m';
  const staleColor = report.summary.stale_pages > 0 ? '\x1b[33m' : '\x1b[32m';
  const orphanedColor = report.summary.orphaned_pages > 0 ? '\x1b[33m' : '\x1b[32m';
  const brokenColor = report.summary.broken_links > 0 ? '\x1b[31m' : '\x1b[32m';
  const dataColor = report.summary.data_consistency_issues > 0 ? '\x1b[31m' : '\x1b[32m';
  
  console.log(`${fmColor}  Frontmatter 问题: ${report.summary.frontmatter_issues}\x1b[0m`);
  console.log(`${staleColor}  陈旧页面: ${report.summary.stale_pages}\x1b[0m`);
  console.log(`${orphanedColor}  孤立页面: ${report.summary.orphaned_pages}\x1b[0m`);
  console.log(`${brokenColor}  断链: ${report.summary.broken_links}\x1b[0m`);
  console.log(`${dataColor}  数据一致性问题: ${report.summary.data_consistency_issues}\x1b[0m`);

  if (report.frontmatter_issues.length > 0) {
    console.log('\n' + '─'.repeat(60));
    console.log('⚠️  Frontmatter 问题:');
    for (const item of report.frontmatter_issues.slice(0, 5)) {
      console.log(`  [[${item.page}]]: ${item.issues.join(', ')}`);
    }
    if (report.frontmatter_issues.length > 5) {
      console.log(`  ... 还有 ${report.frontmatter_issues.length - 5} 个问题`);
    }
  }

  if (report.broken_links.length > 0) {
    console.log('\n' + '─'.repeat(60));
    console.log('❌ 断链:');
    for (const link of report.broken_links.slice(0, 5)) {
      console.log(`  [[${link.from_page}]] → [[${link.broken_link}]]`);
    }
    if (report.broken_links.length > 5) {
      console.log(`  ... 还有 ${report.broken_links.length - 5} 个断链`);
    }
  }

  if (report.data_consistency_issues.length > 0) {
    console.log('\n' + '─'.repeat(60));
    console.log('❌ 数据一致性问题:');
    for (const item of report.data_consistency_issues) {
      console.log(`  [[${item.page}]]: ${item.issue}`);
    }
  }

  console.log('═'.repeat(60) + '\n');

  const totalIssues = report.summary.frontmatter_issues + 
                     report.summary.stale_pages + 
                     report.summary.orphaned_pages + 
                     report.summary.broken_links + 
                     report.summary.data_consistency_issues;

  if (totalIssues === 0) {
    console.log('✅ 知识库状态良好！\n');
  } else {
    console.log(`⚠️  发现 ${totalIssues} 个需要关注的问题\n`);
  }
}

async function main(options = {}) {
  console.log('🔍 正在运行知识库健康检查...');

  try {
    const pages = await getAllWikiPages();

    if (options.fix) {
      console.log('🔧 自动修复模式');
      console.log('─'.repeat(60));
      
      const fixResults = await autoFixAll(pages, options);
      
      if (fixResults.length === 0) {
        console.log('✅ 没有需要修复的问题\n');
      } else {
        console.log(`✅ 已修复 ${fixResults.length} 个页面:\n`);
        for (const result of fixResults) {
          console.log(`  [[${result.page}]]:`);
          for (const fix of result.fixes) {
            console.log(`    - ${fix}`);
          }
        }
        console.log('');
      }
      
      if (!options.dryRun) {
        console.log('📊 再次检查确认修复...');
        const report = await generateLintReport();
        if (options.format === 'json') {
          console.log(JSON.stringify(report, null, 2));
        } else {
          printColoredReport(report);
        }
      }
    } else {
      const report = await generateLintReport();

      if (options.format === 'json') {
        console.log(JSON.stringify(report, null, 2));
      } else {
        printColoredReport(report);
      }
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

program
  .name('lint.js')
  .description('知识库健康检查 - 检查 frontmatter、断链、数据一致性等')
  .option('-f, --format <format>', '输出格式 (console|json)', 'console')
  .option('-v, --verbose', '显示详细错误信息')
  .option('--fix', '自动修复 frontmatter 问题')
  .option('-n, --dry-run', '预览模式，不实际修改文件')
  .parse(process.argv);

main(program.opts());
