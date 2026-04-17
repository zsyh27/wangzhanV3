const fs = require('fs');
const path = require('path');

const OLD_ENTITIES_DIR = path.join(__dirname, '..', 'wiki.backup', 'entities');
const NEW_ENTITIES_DIR = path.join(__dirname, '..', 'wiki', 'entities');

function extractSections(content) {
  const sections = {};
  const lines = content.split('\n');
  let currentSection = null;
  let currentContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = line.slice(3).trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return sections;
}

function mergeFiles(oldPath, newPath) {
  if (!fs.existsSync(oldPath) || !fs.existsSync(newPath)) {
    return false;
  }

  const oldContent = fs.readFileSync(oldPath, 'utf8');
  const newContent = fs.readFileSync(newPath, 'utf8');

  const oldSections = extractSections(oldContent);
  const newSections = extractSections(newContent);

  const frontmatterMatch = newContent.match(/^---\n[\s\S]*?\n---/);
  if (!frontmatterMatch) {
    return false;
  }

  const frontmatter = frontmatterMatch[0];
  let mergedContent = frontmatter + '\n\n';

  const h1Match = newContent.match(/^# .+$/m);
  if (h1Match) {
    mergedContent += h1Match[0] + '\n\n';
  }

  const order = [
    '产品概述',
    '技术参数',
    '材质说明',
    '材质',
    '材质和重量',
    '产品特性',
    '功能说明和设置',
    '功能说明',
    '拨码说明和设置',
    'NFC设置说明',
    '订货信息',
    '订货信息和参数',
    '尺寸和重量',
    '配套阀门',
    '应用场景',
    '选型要点',
    '选型指南',
    '安装说明',
    '常见问题',
    '联系我们'
  ];

  const addedSections = new Set();

  order.forEach(sectionName => {
    let content = null;
    if (oldSections[sectionName] && !sectionName.includes('技术参数') && !sectionName.includes('材质')) {
      content = oldSections[sectionName];
    } else if (newSections[sectionName]) {
      content = newSections[sectionName];
    }

    if (content && !addedSections.has(sectionName)) {
      mergedContent += `## ${sectionName}\n\n${content}\n\n`;
      addedSections.add(sectionName);
    }
  });

  Object.keys(newSections).forEach(sectionName => {
    if (!addedSections.has(sectionName) && !order.includes(sectionName)) {
      mergedContent += `## ${sectionName}\n\n${newSections[sectionName]}\n\n`;
    }
  });

  fs.writeFileSync(newPath, mergedContent.trim() + '\n', 'utf8');
  return true;
}

const newFiles = fs.readdirSync(NEW_ENTITIES_DIR).filter(f => f.endsWith('.md'));
let mergedCount = 0;

newFiles.forEach(newFile => {
  const baseName = newFile.replace('.md', '').replace('系列', '').toLowerCase();
  const oldFile = baseName + '.md';
  const oldPath = path.join(OLD_ENTITIES_DIR, oldFile);
  const newPath = path.join(NEW_ENTITIES_DIR, newFile);

  if (mergeFiles(oldPath, newPath)) {
    console.log(`[合并] ${newFile}`);
    mergedCount++;
  } else {
    console.log(`[跳过] ${newFile}`);
  }
});

console.log(`\n合并完成！共合并 ${mergedCount} 个文件`);
