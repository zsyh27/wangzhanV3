const fs = require('fs');
const path = require('path');

const ENTITIES_DIR = path.join(__dirname, '..', 'wiki', 'entities');
const TODAY = new Date().toISOString();

const files = fs.readdirSync(ENTITIES_DIR).filter(f => f.endsWith('.md'));

files.forEach(file => {
  const filePath = path.join(ENTITIES_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    console.log(`Skipping ${file} - no frontmatter found`);
    return;
  }

  let frontmatter = frontmatterMatch[1];
  const lines = frontmatter.split('\n');
  const fm = {};
  lines.forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      }
      fm[key] = value;
    }
  });

  const series = fm.series || fm.title.match(/^([A-Z0-9]+)/i)?.[1] || '';
  const slug = series.toLowerCase();
  const seoTitle = `霍尼韦尔${series}_${fm.category}_产品参数_湖北科信达`;
  const seoDescription = `湖北科信达为您详细介绍霍尼韦尔${fm.title}技术参数、特点及应用，霍尼韦尔阀门湖北官方授权代理商，正品保障。`;

  const newFrontmatterLines = [];
  newFrontmatterLines.push(`title: ${fm.title}`);
  newFrontmatterLines.push(`slug: ${slug}`);
  newFrontmatterLines.push(`date: ${TODAY}`);
  newFrontmatterLines.push(`author: 湖北科信达机电设备有限公司技术部`);
  newFrontmatterLines.push(`category: ${fm.category}`);
  newFrontmatterLines.push(`status: published`);
  newFrontmatterLines.push(`seoTitle: ${seoTitle}`);
  newFrontmatterLines.push(`seoDescription: ${seoDescription}`);
  newFrontmatterLines.push(`keywords: ${fm.keywords}`);
  newFrontmatterLines.push(`model: ${series}`);
  newFrontmatterLines.push(`brand: ${fm.brand}`);
  newFrontmatterLines.push(`series: ${series}`);

  const newFrontmatter = newFrontmatterLines.join('\n');
  const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${newFrontmatter}\n---`);

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Updated ${file}`);
});

console.log('Done!');
