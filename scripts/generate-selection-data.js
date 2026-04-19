const fs = require('fs');
const path = require('path');

function parseSelectionParams(content) {
  const titleIndex = content.indexOf('选型参数');
  if (titleIndex === -1) {
    return null;
  }
  
  const tableStart = content.indexOf('| 选型参数 | 规格 |', titleIndex);
  if (tableStart === -1) {
    return null;
  }
  
  const afterTable = content.indexOf('## 技术参数', tableStart);
  const tableContent = content.substring(tableStart, afterTable !== -1 ? afterTable : content.length);
  
  const rows = tableContent.split('\n').filter(row => row.trim() && row.includes('|'));
  
  const params = {};
  rows.forEach(row => {
    const cells = row.split('|').map(c => c.trim()).filter(c => c);
    if (cells.length >= 2 && cells[0] !== '选型参数') {
      params[cells[0]] = cells[1];
    }
  });
  
  return params;
}

function parseSimpleFrontmatter(raw) {
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  let frontmatter = {};
  let content = raw;
  
  if (frontmatterMatch) {
    const frontmatterRaw = frontmatterMatch[1];
    content = frontmatterMatch[2];
    
    frontmatterRaw.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        if (value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch {
          }
        }
        
        frontmatter[key] = value;
      }
    });
  }
  
  return { frontmatter, content: content.trim() };
}

function mapToSelectionFormat(params, slug, frontmatterModel) {
  const model = frontmatterModel || slug.toUpperCase();
  const sizeRange = params['阀门口径'] || '';

  if (!sizeRange || sizeRange === '-') return null;

  let connection = 'flange';
  const connectionParam = params['连接方式'];
  if (connectionParam?.includes('螺纹')) {
    connection = 'thread';
  } else if (connectionParam?.includes('法兰')) {
    connection = 'flange';
  }

  let control = 'modulating';
  const controlParam = params['控制方式'];
  if (controlParam?.includes('开关') && controlParam?.includes('调节')) {
    control = 'both';
  } else if (controlParam?.includes('开关')) {
    control = 'on-off';
  } else if (controlParam?.includes('调节')) {
    control = 'modulating';
  }

  let media = 'cold-hot-water';
  const mediaParam = params['工况介质'];
  if (mediaParam?.includes('冷热水') && mediaParam?.includes('蒸汽')) {
    media = 'both';
  } else if (mediaParam?.includes('蒸汽')) {
    media = 'steam';
  } else if (mediaParam?.includes('冷热水')) {
    media = 'cold-hot-water';
  }

  return {
    model,
    slug,
    sizeRange,
    connection,
    control,
    media
  };
}

function generateSelectionData() {
  const productsDir = path.join(process.cwd(), 'content', 'products');
  const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.md'));

  const products = [];

  for (const file of files) {
    const filePath = path.join(productsDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, content: markdownContent } = parseSimpleFrontmatter(raw);

    const params = parseSelectionParams(markdownContent);
    if (params) {
      const slug = file.replace('.md', '');
      const product = mapToSelectionFormat(params, slug, frontmatter.model);
      if (product) {
        products.push(product);
      }
    }
  }

  const outputDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'selection-products.json');
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));

  console.log('✅ 成功生成了 ' + products.length + ' 个选型产品数据');
  console.log('📁 数据已保存到: ' + outputPath);
  console.log('\n产品列表:');
  products.forEach(p => {
    console.log('  - ' + p.model);
  });
}

generateSelectionData();
