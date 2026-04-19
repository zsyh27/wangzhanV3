/**
 * 从 DOCX 文件中提取图片并生成产品详情 MD 文件
 * 
 * 使用方法:
 * node scripts/extract-docx-images.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置路径
const CONFIG = {
  docxPath: path.join(process.cwd(), 'llm-wiki-karpathy', 'raw', 'pdfs', '霍尼韦尔暖通空调电动阀与执行器综合样册-2025.docx'),
  extractDir: path.join(process.cwd(), 'temp', 'docx-extract'),
  outputImagesDir: path.join(process.cwd(), 'public', 'images', 'products'),
  productsDir: path.join(process.cwd(), 'content', 'products'),
};

// 产品型号映射（根据图片文件名或文档内容识别）
const PRODUCT_MODELS = [
  'V5011B2W', 'V5011B3W', 'V5011S2S', 'V5011S2W', 'V5011S3W',
  'V5GV2S', 'V5GV2W', 'V5GV3W', 'V6GV', 'V8BF',
  'V9BF', 'V9BFW25', 'VBA16F', 'VBA16P', 'VBA16PE',
  'VBF16', 'VH58', 'ML74', 'ML8624', 'ML8824',
  'MVN', 'NOM'
];

/**
 * 解压 DOCX 文件（DOCX 实际上是 ZIP 格式）
 */
function extractDocx() {
  console.log('📦 正在解压 DOCX 文件...');
  
  // 创建临时目录
  if (!fs.existsSync(CONFIG.extractDir)) {
    fs.mkdirSync(CONFIG.extractDir, { recursive: true });
  }
  
  // 复制 DOCX 文件并改后缀为 ZIP
  const zipPath = path.join(CONFIG.extractDir, 'temp.zip');
  fs.copyFileSync(CONFIG.docxPath, zipPath);
  
  // 解压 ZIP 文件
  try {
    execSync(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${CONFIG.extractDir}' -Force"`, {
      stdio: 'inherit'
    });
    console.log('✅ DOCX 解压成功');
  } catch (error) {
    console.error('❌ 解压失败:', error.message);
    throw error;
  }
}

/**
 * 提取图片文件
 */
function extractImages() {
  console.log('🖼️ 正在提取图片...');
  
  const mediaDir = path.join(CONFIG.extractDir, 'word', 'media');
  
  if (!fs.existsSync(mediaDir)) {
    console.log('⚠️ 未找到媒体文件目录');
    return [];
  }
  
  // 确保输出目录存在
  if (!fs.existsSync(CONFIG.outputImagesDir)) {
    fs.mkdirSync(CONFIG.outputImagesDir, { recursive: true });
  }
  
  // 读取所有媒体文件
  const files = fs.readdirSync(mediaDir);
  const imageFiles = files.filter(f => /\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(f));
  
  console.log(`📸 找到 ${imageFiles.length} 个图片文件`);
  
  // 复制图片到输出目录
  const copiedImages = [];
  imageFiles.forEach((file, index) => {
    const srcPath = path.join(mediaDir, file);
    const ext = path.extname(file);
    
    // 尝试根据内容识别产品型号
    const productModel = identifyProductModel(file, index);
    const destFileName = productModel ? `${productModel}${ext}` : `product-${index + 1}${ext}`;
    const destPath = path.join(CONFIG.outputImagesDir, destFileName);
    
    fs.copyFileSync(srcPath, destPath);
    copiedImages.push({
      original: file,
      newName: destFileName,
      path: `/images/products/${destFileName}`,
      productModel
    });
    
    console.log(`  ✓ ${file} → ${destFileName}`);
  });
  
  return copiedImages;
}

/**
 * 根据文件名或索引识别产品型号
 */
function identifyProductModel(filename, index) {
  // 首先尝试从文件名匹配
  const upperFileName = filename.toUpperCase();
  for (const model of PRODUCT_MODELS) {
    if (upperFileName.includes(model.toUpperCase())) {
      return model;
    }
  }
  
  // 如果文件名无法识别，返回 null
  return null;
}

/**
 * 生成产品详情 Markdown 文件
 */
function generateProductMarkdown(images) {
  console.log('📝 正在生成产品详情 Markdown 文件...');
  
  // 按产品型号分组图片
  const productImages = {};
  images.forEach(img => {
    if (img.productModel) {
      if (!productImages[img.productModel]) {
        productImages[img.productModel] = [];
      }
      productImages[img.productModel].push(img);
    }
  });
  
  // 确保产品目录存在
  if (!fs.existsSync(CONFIG.productsDir)) {
    fs.mkdirSync(CONFIG.productsDir, { recursive: true });
  }
  
  // 为每个产品生成 Markdown 文件
  let generatedCount = 0;
  
  Object.entries(productImages).forEach(([model, imgs]) => {
    const slug = model.toLowerCase();
    const mdPath = path.join(CONFIG.productsDir, `${slug}.md`);
    
    // 构建图片引用
    const imageMarkdown = imgs.map((img, idx) => {
      return `![${model} 产品图 ${idx + 1}](${img.path})
*${model} 产品外观图 ${idx + 1}*`;
    }).join('\n\n');
    
    // 构建 Markdown 内容
    const content = `---
title: 霍尼韦尔 ${model} 系列产品
slug: ${slug}
date: ${new Date().toISOString()}
author: 湖北科信达机电设备有限公司技术部
category: 霍尼韦尔阀门
status: published
seoTitle: 霍尼韦尔${model}_产品参数_技术规格_湖北科信达
seoDescription: 湖北科信达为您详细介绍霍尼韦尔${model}系列产品技术参数、规格型号及应用，霍尼韦尔阀门湖北官方授权代理商，正品保障。
keywords: 霍尼韦尔,${model},电动阀,调节阀,执行器
---

# 霍尼韦尔 ${model} 系列产品

## 产品图片

${imageMarkdown}

## 产品概述

霍尼韦尔 ${model} 系列产品是高品质的暖通空调控制阀门/执行器，适用于商业楼宇、工业厂房等各类建筑的暖通空调系统。

## 主要特点

- 高品质材料制造，确保长期稳定运行
- 精确的流量控制性能
- 与霍尼韦尔执行器完美匹配
- 安装维护简便

## 技术参数

*详细技术参数请参考原始产品手册*

## 应用场景

- 中央空调系统
- 区域供热系统
- 工业过程控制
- 建筑自动化系统

## 联系我们

如需了解更多 ${model} 系列产品信息，欢迎联系湖北科信达机电设备有限公司。

联系电话：13907117179
`;
    
    fs.writeFileSync(mdPath, content, 'utf8');
    generatedCount++;
    console.log(`  ✓ 生成: ${slug}.md (${imgs.length} 张图片)`);
  });
  
  console.log(`\n✅ 共生成 ${generatedCount} 个产品详情文件`);
}

/**
 * 清理临时文件
 */
function cleanup() {
  console.log('🧹 清理临时文件...');
  
  try {
    if (fs.existsSync(CONFIG.extractDir)) {
      fs.rmSync(CONFIG.extractDir, { recursive: true, force: true });
      console.log('✅ 临时文件已清理');
    }
  } catch (error) {
    console.error('⚠️ 清理临时文件失败:', error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始提取 DOCX 图片并生成产品详情...\n');
  
  try {
    // 1. 解压 DOCX
    extractDocx();
    
    // 2. 提取图片
    const images = extractImages();
    
    if (images.length === 0) {
      console.log('⚠️ 未找到任何图片，请检查 DOCX 文件');
      return;
    }
    
    // 3. 生成产品详情 Markdown
    generateProductMarkdown(images);
    
    console.log('\n🎉 全部完成！');
    console.log('\n生成的文件位置:');
    console.log(`  - 产品图片: ${CONFIG.outputImagesDir}`);
    console.log(`  - 产品详情: ${CONFIG.productsDir}`);
    
  } catch (error) {
    console.error('\n❌ 处理失败:', error.message);
    console.error(error.stack);
  } finally {
    // 4. 清理临时文件
    cleanup();
  }
}

// 执行主函数
main();
