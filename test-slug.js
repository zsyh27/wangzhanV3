const fs = require('fs');
const path = require('path');

function getMdFileNames(dir) {
  try {
    if (!fs.existsSync(dir)) {
      return [];
    }
    return fs.readdirSync(dir)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        // 从文件名中提取slug（去掉日期部分）
        const match = file.match(/^\d{4}-\d{2}-\d{2}-(.*)\.md$/);
        console.log(`Processing file: ${file}, match:`, match);
        return match ? match[1] : file.replace(/\.md$/, '');
      });
  } catch (error) {
    console.error(`读取目录失败: ${dir}`, error);
    return [];
  }
}

const contentDir = path.join(process.cwd(), 'content', 'news');
const slugs = getMdFileNames(contentDir);
console.log('Generated slugs:', slugs);

// 测试查找文件
function testFindFile(slug) {
  const files = fs.readdirSync(contentDir);
  const targetFile = files.find(file => file.endsWith(`-${slug}.md`));
  console.log(`Looking for slug: ${slug}, found file:`, targetFile);
  return targetFile;
}

slugs.forEach(slug => {
  testFindFile(slug);
});
