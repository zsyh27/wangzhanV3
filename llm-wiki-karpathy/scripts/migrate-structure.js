#!/usr/bin/env node

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT_DIR = path.join(__dirname, '..');
const OLD_PRODUCTS_DIR = path.join(ROOT_DIR, 'wiki', 'products');
const NEW_ENTITIES_DIR = path.join(ROOT_DIR, 'wiki', 'entities');
const OLD_SELECTION_DIR = path.join(ROOT_DIR, 'wiki', 'selection-guide');
const NEW_TOPICS_DIR = path.join(ROOT_DIR, 'wiki', 'topics');
const SOURCES_DIR = path.join(ROOT_DIR, 'wiki', 'sources');

/**
 * 从 category 推断产品信息
 * @param {string} category - 原分类
 * @param {string} title - 原标题
 * @returns {Object} 实体信息
 */
function inferEntityInfo(category, title) {
  const info = {
    brand: '霍尼韦尔',
    productLine: '未知',
    productType: '未知',
    mediaType: '未知',
    type: 'entity'
  };

  const categoryLower = category.toLowerCase();
  const titleLower = title.toLowerCase();

  if (categoryLower.includes('执行器') || titleLower.includes('ml') || titleLower.includes('mvn') || titleLower.includes('nom')) {
    info.productLine = '执行器';
    info.productType = '直行程电动执行器';
  } else if (categoryLower.includes('座阀') || titleLower.includes('v5011') || titleLower.includes('v5gv') || titleLower.includes('v6gv')) {
    info.productLine = '座阀';
    if (titleLower.includes('二通')) {
      info.productType = '电动二通阀';
    } else if (titleLower.includes('三通')) {
      info.productType = '电动三通阀';
    } else {
      info.productType = '电动座阀';
    }
    if (titleLower.includes('蒸汽') || titleLower.includes('s2s')) {
      info.mediaType = '蒸汽';
    } else {
      info.mediaType = '冷热水';
    }
  } else if (categoryLower.includes('球阀') || titleLower.includes('vba') || titleLower.includes('v8bfs') || titleLower.includes('v9bf')) {
    info.productLine = '球阀';
    info.productType = '电动球阀';
    info.mediaType = '冷热水';
  }

  return info;
}

/**
 * 从文件名提取产品型号
 * @param {string} filename - 文件名
 * @returns {string} 产品型号
 */
function extractModel(filename) {
  return path.basename(filename, '.md').toUpperCase();
}

/**
 * 迁移单个实体页面
 * @param {string} srcPath - 源文件路径
 * @param {string} destPath - 目标文件路径
 */
async function migrateEntityFile(srcPath, destPath) {
  const content = await fs.readFile(srcPath, 'utf-8');
  const parsed = matter(content);
  const filename = path.basename(srcPath);
  const model = extractModel(filename);
  const category = parsed.data.category || '';
  const title = parsed.data.title || '';

  const entityInfo = inferEntityInfo(category, title);

  const newFrontmatter = {
    ...parsed.data,
    type: 'entity',
    model: model,
    brand: entityInfo.brand,
    productLine: entityInfo.productLine,
    productType: entityInfo.productType,
    mediaType: entityInfo.mediaType,
    relatedEntities: [],
    relatedTopics: [],
    sources: [
      'pdfs/霍尼韦尔暖通空调电动阀与执行器综合样册-2025.pdf'
    ]
  };

  const newContent = matter.stringify(parsed.content, newFrontmatter);
  await fs.writeFile(destPath, newContent);
  
  console.log(`✅ 迁移: ${filename} → entities/${filename}`);
}

/**
 * 迁移单个主题页面
 * @param {string} srcPath - 源文件路径
 * @param {string} destPath - 目标文件路径
 */
async function migrateTopicFile(srcPath, destPath) {
  const content = await fs.readFile(srcPath, 'utf-8');
  const parsed = matter(content);
  const filename = path.basename(srcPath);

  const newFrontmatter = {
    ...parsed.data,
    type: 'topic',
    tags: [parsed.data.category || '技术文章'],
    relatedEntities: [],
    relatedTopics: []
  };

  const newContent = matter.stringify(parsed.content, newFrontmatter);
  await fs.writeFile(destPath, newContent);
  
  console.log(`✅ 迁移: ${filename} → topics/${filename}`);
}

/**
 * 创建素材摘要页
 */
async function createSourcePage() {
  const frontmatter = {
    title: '霍尼韦尔暖通空调电动阀与执行器综合样册-2025',
    sourceType: 'pdf',
    sourcePath: '../raw/pdfs/霍尼韦尔暖通空调电动阀与执行器综合样册-2025.pdf',
    date: '2026-04-13'
  };

  const content = `# 素材摘要

## 来源信息
- **文档名称**：霍尼韦尔暖通空调电动阀与执行器综合样册-2025
- **文档类型**：产品样册
- **发布日期**：2025年
- **页数**：约 200 页

## 主要内容
本文档涵盖霍尼韦尔全系列电动阀与执行器产品，包括：
- V5011 系列螺纹型座阀
- V5GV 系列法兰型座阀
- V6GV 系列高压座阀
- ML74/ML8824 系列执行器
...

## 生成的实体页
- [[V5011B2W]]
- [[V5011S2W]]
- [[V5GV2W]]
- [[ML74]]
- [[ML8824]]
...

## 生成的主题页
- [[阀门选型]]
- [[蒸汽阀选型]]
...
`;

  const fullContent = matter.stringify(content, frontmatter);
  const outputPath = path.join(SOURCES_DIR, 'honeywell-catalog-2025.md');
  await fs.writeFile(outputPath, fullContent);
  console.log(`✅ 创建: sources/honeywell-catalog-2025.md`);
}

/**
 * 更新 index.md
 */
async function updateIndex() {
  const entities = await fs.readdir(NEW_ENTITIES_DIR);
  const topics = await fs.readdir(NEW_TOPICS_DIR);
  
  let entityList = '';
  let topicList = '';
  
  for (const file of entities) {
    if (file.endsWith('.md')) {
      const content = await fs.readFile(path.join(NEW_ENTITIES_DIR, file), 'utf-8');
      const parsed = matter(content);
      const model = parsed.data.model || path.basename(file, '.md').toUpperCase();
      const productLine = parsed.data.productLine || '';
      const category = parsed.data.category || '';
      entityList += `- [[${model}]] - ${category}\n`;
    }
  }
  
  for (const file of topics) {
    if (file.endsWith('.md')) {
      const content = await fs.readFile(path.join(NEW_TOPICS_DIR, file), 'utf-8');
      const parsed = matter(content);
      const title = parsed.data.title || path.basename(file, '.md');
      topicList += `- [[${title}]]\n`;
    }
  }

  const indexContent = `# 知识库索引

## 实体页（entities/）

### 电动座阀

### 电动球阀

### 执行器
${entityList}

## 主题页（topics/）
${topicList}

## 对比分析（comparisons/）

## 综合分析（synthesis/）
`;

  await fs.writeFile(path.join(ROOT_DIR, 'wiki', 'index.md'), indexContent);
  console.log('✅ 更新: wiki/index.md');
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================');
  console.log('  LLM Wiki - 结构迁移');
  console.log('========================================');
  console.log();

  try {
    // 1. 确保目标目录存在
    if (!fsSync.existsSync(NEW_ENTITIES_DIR)) {
      await fs.mkdir(NEW_ENTITIES_DIR, { recursive: true });
    }
    if (!fsSync.existsSync(NEW_TOPICS_DIR)) {
      await fs.mkdir(NEW_TOPICS_DIR, { recursive: true });
    }

    // 2. 迁移产品页面
    console.log('📦 迁移产品页面 (products/ → entities/)...');
    const productFiles = await fs.readdir(OLD_PRODUCTS_DIR);
    let migratedCount = 0;
    
    for (const file of productFiles) {
      if (file.endsWith('.md')) {
        const srcPath = path.join(OLD_PRODUCTS_DIR, file);
        const destPath = path.join(NEW_ENTITIES_DIR, file);
        await migrateEntityFile(srcPath, destPath);
        migratedCount++;
      }
    }
    console.log(`✅ 迁移了 ${migratedCount} 个产品页面`);
    console.log();

    // 3. 迁移选型指南
    console.log('📚 迁移选型指南 (selection-guide/ → topics/)...');
    const selectionFiles = await fs.readdir(OLD_SELECTION_DIR);
    migratedCount = 0;
    
    for (const file of selectionFiles) {
      if (file.endsWith('.md')) {
        const srcPath = path.join(OLD_SELECTION_DIR, file);
        const destPath = path.join(NEW_TOPICS_DIR, file);
        await migrateTopicFile(srcPath, destPath);
        migratedCount++;
      }
    }
    console.log(`✅ 迁移了 ${migratedCount} 个主题页面`);
    console.log();

    // 4. 创建素材摘要页
    console.log('📄 创建素材摘要页...');
    await createSourcePage();
    console.log();

    // 5. 更新 index.md
    console.log('📋 更新索引...');
    await updateIndex();
    console.log();

    // 6. 更新 log.md
    const logContent = `# 操作日志

## [2026-04-13] init | 知识库初始化
- 创建 manifests/ 目录
- 创建 wiki/explorations/ 目录
- 创建 wiki/decisions/ 目录
- 创建 wiki/sources/ 目录
- 创建 wiki/drafts/ 目录
- 初始化 raw-sources.csv

## [2026-04-13] migrate | 目录结构迁移
- 迁移 wiki/products/ → wiki/entities/
- 迁移 wiki/selection-guide/ → wiki/topics/
- 创建 sources/honeywell-catalog-2025.md
- 更新 wiki/index.md
`;
    await fs.writeFile(path.join(ROOT_DIR, 'wiki', 'log.md'), logContent);
    console.log('✅ 更新: wiki/log.md');
    console.log();

    console.log('========================================');
    console.log('  迁移完成！');
    console.log('========================================');
    console.log();
    console.log('下一步:');
    console.log('  1. 检查迁移后的内容');
    console.log('  2. 使用 Obsidian 打开 vault 查看关系图谱');
    console.log('  3. 开发 ingest.js 增强版');
    console.log();

  } catch (error) {
    console.error('❌ 错误:');
    console.error(error);
    process.exit(1);
  }
}

main();
