const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

// 确保图片目录存在
const imageDir = path.join(__dirname, '../public/images/about');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
  console.log('创建图片目录:', imageDir);
}

// 从HTML中提取base64图片并保存为文件
function extractBase64Images(html) {
  const base64Regex = /data:image\/(jpeg|png|gif);base64,([^"']+)/g;
  let match;
  const images = [];
  
  while ((match = base64Regex.exec(html)) !== null) {
    const [fullMatch, format, base64Data] = match;
    const imageName = `certificate-${Date.now()}-${Math.floor(Math.random() * 1000)}.${format}`;
    const imagePath = path.join(imageDir, imageName);
    
    // 解码base64数据并保存为文件
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(imagePath, buffer);
    console.log('保存base64图片:', imageName);
    
    images.push({
      original: fullMatch,
      replacement: `/images/about/${imageName}`
    });
  }
  
  // 替换HTML中的base64图片为文件路径
  let processedHtml = html;
  images.forEach(image => {
    processedHtml = processedHtml.replace(image.original, image.replacement);
  });
  
  return {
    html: processedHtml,
    images: images.map(img => img.replacement)
  };
}

async function parseWordDocument() {
  try {
    const filePath = 'd:\\wangzhan\\app\\about\\企业资质资料2.docx';
    
    console.log('开始解析Word文档...');
    
    // 提取文本和图片
    const result = await mammoth.extractRawText({
      path: filePath
    });
    
    const text = result.value;
    const messages = result.messages;
    
    console.log('解析完成！');
    console.log('\n=== 文档内容 ===');
    console.log(text);
    
    if (messages.length > 0) {
      console.log('\n=== 解析消息 ===');
      messages.forEach(message => {
        console.log(message);
      });
    }
    
    // 保存解析结果到文件
    fs.writeFileSync('d:\\wangzhan\\app\\about\\document-content.txt', text);
    console.log('\n解析结果已保存到 document-content.txt');
    
    // 尝试提取图片
    console.log('\n开始提取图片...');
    const imageResult = await mammoth.convertToHtml({
      path: filePath
    });
    
    // 提取base64图片并保存为文件
    const processedResult = extractBase64Images(imageResult.value);
    
    console.log('\n图片提取完成！');
    console.log('\n=== 提取的图片 ===');
    processedResult.images.forEach(image => {
      console.log(image);
    });
    
    console.log('\n=== HTML内容 ===');
    console.log(processedResult.html.substring(0, 1000) + '...'); // 只显示前1000个字符
    
    // 保存HTML到文件
    fs.writeFileSync('d:\\wangzhan\\app\\about\\document-content.html', processedResult.html);
    console.log('\nHTML结果已保存到 document-content.html');
    
  } catch (error) {
    console.error('解析文档时出错:', error);
  }
}

parseWordDocument();
