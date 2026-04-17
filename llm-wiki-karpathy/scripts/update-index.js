const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

const ROOT_DIR = path.join(__dirname, '..');
const WIKI_DIR = path.join(ROOT_DIR, 'wiki');
const INDEX_PATH = path.join(WIKI_DIR, 'index.md');

const { getAllWikiPages } = require('../lib/stale-detector');

function groupPagesByType(pages) {
  const groups = {
    entities: [],
    topics: [],
    comparisons: [],
    synthesis: [],
    sources: [],
    explorations: [],
    decisions: []
  };

  for (const page of pages) {
    const relPath = page.relativePath;
    
    if (relPath.startsWith('entities/')) {
      groups.entities.push(page);
    } else if (relPath.startsWith('topics/')) {
      groups.topics.push(page);
    } else if (relPath.startsWith('comparisons/')) {
      groups.comparisons.push(page);
    } else if (relPath.startsWith('synthesis/')) {
      groups.synthesis.push(page);
    } else if (relPath.startsWith('sources/')) {
      groups.sources.push(page);
    } else if (relPath.startsWith('explorations/')) {
      groups.explorations.push(page);
    } else if (relPath.startsWith('decisions/')) {
      groups.decisions.push(page);
    }
  }

  return groups;
}

function groupEntitiesByProductLine(entities) {
  const groups = {};

  for (const entity of entities) {
    const productLine = entity.frontmatter.productLine || '其他';
    if (!groups[productLine]) {
      groups[productLine] = [];
    }
    groups[productLine].push(entity);
  }

  return groups;
}

function generateIndexContent(groups) {
  let content = '# 知识库索引\n\n';
  content += `生成时间: ${new Date().toISOString()}\n\n`;

  if (groups.entities.length > 0) {
    content += '## 实体页（entities/）\n\n';
    const entityGroups = groupEntitiesByProductLine(groups.entities);
    
    for (const [productLine, entities] of Object.entries(entityGroups)) {
      content += `### ${productLine}\n`;
      for (const entity of entities.sort((a, b) => a.name.localeCompare(b.name))) {
        const title = entity.frontmatter.title || entity.name;
        const desc = entity.frontmatter.productType || '';
        content += `- [[${entity.name}]] - ${title}${desc ? ` (${desc})` : ''}\n`;
      }
      content += '\n';
    }
  }

  if (groups.topics.length > 0) {
    content += '## 主题页（topics/）\n\n';
    for (const topic of groups.topics.sort((a, b) => a.name.localeCompare(b.name))) {
      const title = topic.frontmatter.title || topic.name;
      content += `- [[${topic.name}]] - ${title}\n`;
    }
    content += '\n';
  }

  if (groups.comparisons.length > 0) {
    content += '## 对比分析（comparisons/）\n\n';
    for (const comparison of groups.comparisons.sort((a, b) => a.name.localeCompare(b.name))) {
      const title = comparison.frontmatter.title || comparison.name;
      content += `- [[${comparison.name}]] - ${title}\n`;
    }
    content += '\n';
  }

  if (groups.synthesis.length > 0) {
    content += '## 综合分析（synthesis/）\n\n';
    for (const synthesis of groups.synthesis.sort((a, b) => a.name.localeCompare(b.name))) {
      const title = synthesis.frontmatter.title || synthesis.name;
      content += `- [[${synthesis.name}]] - ${title}\n`;
    }
    content += '\n';
  }

  if (groups.sources.length > 0) {
    content += '## 素材摘要（sources/）\n\n';
    for (const source of groups.sources.sort((a, b) => a.name.localeCompare(b.name))) {
      const title = source.frontmatter.title || source.name;
      content += `- [[${source.name}]] - ${title}\n`;
    }
    content += '\n';
  }

  if (groups.explorations.length > 0) {
    content += '## 研究探索（explorations/）\n\n';
    for (const exploration of groups.explorations.sort((a, b) => a.name.localeCompare(b.name))) {
      const title = exploration.frontmatter.title || exploration.name;
      content += `- [[${exploration.name}]] - ${title}\n`;
    }
    content += '\n';
  }

  if (groups.decisions.length > 0) {
    content += '## 决策日志（decisions/）\n\n';
    for (const decision of groups.decisions.sort((a, b) => a.name.localeCompare(b.name))) {
      const title = decision.frontmatter.title || decision.name;
      content += `- [[${decision.name}]] - ${title}\n`;
    }
    content += '\n';
  }

  return content;
}

async function main() {
  console.log('📑 正在更新知识库索引...\n');

  try {
    const pages = await getAllWikiPages();
    const groups = groupPagesByType(pages);
    const content = generateIndexContent(groups);

    await fs.writeFile(INDEX_PATH, content, 'utf8');

    console.log('✅ 索引更新成功！');
    console.log(`   实体页: ${groups.entities.length}`);
    console.log(`   主题页: ${groups.topics.length}`);
    console.log(`   对比分析: ${groups.comparisons.length}`);
    console.log(`   综合分析: ${groups.synthesis.length}`);
    console.log(`   素材摘要: ${groups.sources.length}`);
    console.log(`   研究探索: ${groups.explorations.length}`);
    console.log(`   决策日志: ${groups.decisions.length}`);
    console.log(`\n   总计: ${pages.length} 个页面\n`);

  } catch (error) {
    console.error('❌ 更新索引失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  generateIndexContent
};
