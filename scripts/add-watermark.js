const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 图片目录
const imageDir = path.join(__dirname, '../public/images/about');
const outputDir = path.join(__dirname, '../public/images/about/watermarked');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('创建输出目录:', outputDir);
}

// 水印文本
const watermarkText = '霍尼韦尔阀门湖北授权代理商';

async function addWatermarkToImage(imagePath, outputPath) {
  try {
    // 读取图片
    const image = sharp(imagePath);
    
    // 获取图片信息
    const metadata = await image.metadata();
    
    // 计算水印位置和大小
    const width = metadata.width || 400;
    const height = metadata.height || 300;
    
    // 创建水印
    const watermark = await sharp(Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text
          x="50%"
          y="90%"
          font-family="Arial"
          font-size="16"
          font-weight="bold"
          fill="rgba(255, 255, 255, 0.8)"
          text-anchor="middle"
          stroke="rgba(0, 0, 0, 0.5)"
          stroke-width="1"
        >
          ${watermarkText}
        </text>
      </svg>
    `)).toBuffer();
    
    // 合成图片
    await image
      .composite([{ input: watermark, gravity: 'southeast' }])
      .toFile(outputPath);
    
    console.log(`已添加水印: ${path.basename(imagePath)}`);
  } catch (error) {
    console.error(`处理图片 ${path.basename(imagePath)} 时出错:`, error);
  }
}

async function processAllImages() {
  try {
    // 读取目录中的所有图片
    const files = fs.readdirSync(imageDir);
    
    // 过滤出图片文件
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });
    
    console.log(`找到 ${imageFiles.length} 张图片需要添加水印`);
    
    // 处理每张图片
    for (const file of imageFiles) {
      const imagePath = path.join(imageDir, file);
      const outputPath = path.join(outputDir, file);
      await addWatermarkToImage(imagePath, outputPath);
    }
    
    console.log('所有图片水印添加完成！');
  } catch (error) {
    console.error('处理图片时出错:', error);
  }
}

processAllImages();
