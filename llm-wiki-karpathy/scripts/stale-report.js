const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');

const {
  generateStaleReport,
  formatReportAsMarkdown
} = require('../lib/stale-detector');

const ROOT_DIR = path.join(__dirname, '..');

function printColoredReport(report) {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 知识库陈旧内容报告');
  console.log('─'.repeat(60));
  console.log(`生成时间: ${report.generated_at}`);
  console.log('\n摘要:');
  console.log(`  总页面数: ${report.summary.total_wiki_pages}`);
  
  const staleColor = report.summary.stale_pages > 0 ? '\x1b[33m' : '\x1b[32m';
  const orphanedColor = report.summary.orphaned_pages > 0 ? '\x1b[33m' : '\x1b[32m';
  const brokenColor = report.summary.broken_links > 0 ? '\x1b[31m' : '\x1b[32m';
  
  console.log(`${staleColor}  陈旧页面: ${report.summary.stale_pages}\x1b[0m`);
  console.log(`${orphanedColor}  孤立页面: ${report.summary.orphaned_pages}\x1b[0m`);
  console.log(`${brokenColor}  断链: ${report.summary.broken_links}\x1b[0m`);
  
  if (report.stale_pages.length > 0) {
    console.log('\n' + '─'.repeat(60));
    console.log('⚠️  陈旧页面:');
    for (const page of report.stale_pages) {
      const impactColor = page.impact.level === 'high' ? '\x1b[31m' : 
                          page.impact.level === 'medium' ? '\x1b[33m' : '\x1b[36m';
      console.log(`  ${impactColor}[${page.impact.level.toUpperCase()}]\x1b[0m [[${page.page}]]`);
      console.log(`     素材: ${page.source} (${page.source_updated})`);
      console.log(`     陈旧: ${page.stale_days} 天`);
    }
  }
  
  if (report.orphaned_pages.length > 0) {
    console.log('\n' + '─'.repeat(60));
    console.log('🔗 孤立页面:');
    for (const page of report.orphaned_pages) {
      console.log(`  [[${page.page}]] - ${page.page_path}`);
    }
  }
  
  if (report.broken_links.length > 0) {
    console.log('\n' + '─'.repeat(60));
    console.log('❌ 断链:');
    for (const link of report.broken_links) {
      console.log(`  [[${link.from_page}]] → [[${link.broken_link}]]`);
    }
  }
  
  if (report.recommendations.length > 0) {
    console.log('\n' + '─'.repeat(60));
    console.log('💡 建议操作:');
    for (const rec of report.recommendations.slice(0, 5)) {
      const priorityColor = rec.priority === 'high' ? '\x1b[31m' : 
                            rec.priority === 'medium' ? '\x1b[33m' : '\x1b[36m';
      console.log(`  ${priorityColor}[${rec.priority.toUpperCase()}]\x1b[0m ${rec.action} - ${rec.target}`);
      console.log(`     ${rec.reason}`);
    }
    if (report.recommendations.length > 5) {
      console.log(`  ... 还有 ${report.recommendations.length - 5} 条建议`);
    }
  }
  
  console.log('═'.repeat(60) + '\n');
}

async function main(options = {}) {
  console.log('🔍 正在生成陈旧内容报告...\n');
  
  try {
    const report = await generateStaleReport();
    
    if (options.format === 'json') {
      const output = JSON.stringify(report, null, 2);
      if (options.output) {
        await fs.writeFile(path.join(ROOT_DIR, options.output), output, 'utf8');
        console.log(`✅ JSON 报告已保存到: ${options.output}`);
      } else {
        console.log(output);
      }
    } else if (options.format === 'markdown') {
      const md = formatReportAsMarkdown(report);
      if (options.output) {
        await fs.writeFile(path.join(ROOT_DIR, options.output), md, 'utf8');
        console.log(`✅ Markdown 报告已保存到: ${options.output}`);
      } else {
        console.log(md);
      }
    } else {
      printColoredReport(report);
    }
    
    if (report.summary.stale_pages > 0 || report.summary.broken_links > 0) {
      console.log('⚠️  发现需要关注的问题！');
      console.log('   运行 delta-compile.js 来处理陈旧页面\n');
    } else {
      console.log('✅ 知识库状态良好！\n');
    }
    
  } catch (error) {
    console.error('❌ 生成报告失败:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

program
  .name('stale-report.js')
  .description('知识库陈旧内容检测 - 检测陈旧页面、孤立页面和断链')
  .option('-f, --format <format>', '输出格式 (console|json|markdown)', 'console')
  .option('-o, --output <file>', '输出文件路径')
  .option('-v, --verbose', '显示详细错误信息')
  .parse(process.argv);

main(program.opts());
