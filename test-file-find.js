const fs = require('fs');
const path = require('path');

function testFileFind() {
  const contentDir = path.join(process.cwd(), 'content', 'news');
  const slug = '武汉暖通工程';
  
  console.log(`Testing file find for slug: ${slug}`);
  
  try {
    const files = fs.readdirSync(contentDir);
    console.log('Files in directory:', files);
    
    const targetFile = files.find(file => file.endsWith(`-${slug}.md`));
    console.log(`Target file found: ${targetFile}`);
    
    if (targetFile) {
      console.log(`File exists: ${fs.existsSync(path.join(contentDir, targetFile))}`);
    }
    
    // 测试直接匹配
    const directMatch = files.find(file => file.includes(slug));
    console.log(`Direct match found: ${directMatch}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testFileFind();
