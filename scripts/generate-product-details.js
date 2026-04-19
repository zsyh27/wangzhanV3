/**
 * 生成产品详情 Markdown 文件
 * 根据产品图片和PDF提取的参数生成完整的产品详情
 */

const fs = require('fs');
const path = require('path');

// 产品图片目录
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products');
const OUTPUT_DIR = path.join(process.cwd(), 'content', 'products');

// 22个产品的基础信息（从PDF提取）
const PRODUCTS = [
  {
    model: 'V5011B2W',
    name: '螺纹型电动二通座阀',
    category: '电动座阀',
    line: '座阀',
    type: '电动二通阀',
    media: 'cold-hot-water',
    connection: 'thread',
    control: 'modulating',
    pn: 'PN16',
    dnRange: 'DN15-DN50',
    material: '黄铜 HPb59-1',
    tempRange: '-15°C ~ 130°C',
    flowChar: '等百分比',
    turndown: '50:1',
    leakage: '≤ 0.01% Kvs',
    actuator: 'ML74系列、ML8824系列',
    stroke: '20mm',
    related: ['ML74', 'ML8824']
  },
  {
    model: 'V5011B3W',
    name: '螺纹型电动三通座阀（合流）',
    category: '电动座阀',
    line: '座阀',
    type: '电动三通阀',
    media: 'cold-hot-water',
    connection: 'thread',
    control: 'modulating',
    pn: 'PN16',
    dnRange: 'DN15-DN50',
    material: '黄铜 HPb59-1',
    tempRange: '-15°C ~ 130°C',
    flowChar: 'A→AB: 等百分比；B→AB: 线性',
    turndown: '50:1',
    leakage: 'A→AB: ≤0.01% Kvs；B→AB: ≤0.02% Kvs',
    actuator: 'ML74系列、ML8824系列',
    stroke: 'DN15~DN20: 10mm；DN25: 15mm；DN32~DN50: 20mm',
    related: ['ML74', 'ML8824']
  },
  {
    model: 'V5011S2W',
    name: '螺纹型电动二通座阀（不锈钢）',
    category: '电动座阀',
    line: '座阀',
    type: '电动二通阀',
    media: 'cold-hot-water',
    connection: 'thread',
    control: 'modulating',
    pn: 'PN20',
    dnRange: 'DN15-DN50',
    material: '不锈钢 SS304',
    tempRange: '-25°C ~ 130°C',
    flowChar: '等百分比',
    turndown: '50:1',
    leakage: '≤ 0.01% Kvs（IV级泄漏）',
    actuator: 'ML74系列、ML8824系列',
    stroke: 'DN15~DN20: 10mm；DN25: 15mm；DN32~DN50: 20mm',
    related: ['ML74', 'ML8824']
  },
  {
    model: 'V5011S3W',
    name: '螺纹型电动三通座阀（不锈钢）',
    category: '电动座阀',
    line: '座阀',
    type: '电动三通阀',
    media: 'cold-hot-water',
    connection: 'thread',
    control: 'modulating',
    pn: 'PN20',
    dnRange: 'DN15-DN50',
    material: '不锈钢 SS304',
    tempRange: '-25°C ~ 130°C',
    flowChar: 'A→AB: 等百分比；B→AB: 线性',
    turndown: '50:1',
    leakage: 'A→AB: ≤0.01% Kvs；B→AB: ≤0.02% Kvs',
    actuator: 'ML74系列、ML8824系列',
    stroke: 'DN15~DN20: 10mm；DN25: 15mm；DN32~DN50: 20mm',
    related: ['ML74', 'ML8824']
  },
  {
    model: 'V5GV2W',
    name: '法兰型电动二通座阀',
    category: '电动座阀',
    line: '座阀',
    type: '电动二通阀',
    media: 'cold-hot-water',
    connection: 'flange',
    control: 'modulating',
    pn: 'PN16',
    dnRange: 'DN15-DN150',
    material: '球墨铸铁 QT450-10',
    tempRange: '-15°C ~ 130°C',
    flowChar: '等百分比',
    turndown: '50:1',
    leakage: '≤ 0.02% Kvs',
    actuator: 'ML74系列、ML8824系列',
    stroke: 'DN15~DN80: 20mm；DN100~DN150: 40mm',
    related: ['ML74', 'ML8824']
  },
  {
    model: 'V5GV2S',
    name: '法兰型电动蒸汽座阀',
    category: '电动座阀',
    line: '座阀',
    type: '电动二通阀',
    media: 'steam',
    connection: 'flange',
    control: 'modulating',
    pn: 'PN16',
    dnRange: 'DN15-DN150',
    material: '球墨铸铁 QT450-10',
    tempRange: '0°C ~ 180°C',
    flowChar: '等百分比',
    turndown: '50:1',
    leakage: 'IV-S级（0.001% kvs）',
    actuator: 'ML8824系列',
    stroke: 'DN15~DN80: 20mm；DN100~DN150: 40mm',
    related: ['ML8824']
  }
];

// 获取产品图片
function getProductImages(model) {
  const images = [];
  const files = fs.readdirSync(IMAGES_DIR);
  
  files.forEach(file => {
    const fileName = path.parse(file).name;
    // 匹配产品型号（如 V5011B2W 匹配 V5011B2W.png 或 V5011B2W-1.png）
    if (fileName.toUpperCase().startsWith(model.toUpperCase())) {
      images.push({
        file: file,
        path: `/images/products/${file}`
      });
    }
  });
  
  return images.sort((a, b) => a.file.localeCompare(b.file));
}

// 生成 Markdown 图片引用
function generateImageMarkdown(images, model) {
  if (images.length === 0) {
    return `![霍尼韦尔${model}产品图](/images/products/valve-1.svg)
*霍尼韦尔${model}系列产品*`;
  }
  
  return images.map((img, index) => {
    return `![霍尼韦尔${model}产品图 ${index + 1}](${img.path})
*霍尼韦尔${model}系列产品外观图 ${index + 1}*`;
  }).join('\n\n');
}

// 生成产品详情 Markdown
function generateProductMarkdown(product, images) {
  const now = new Date().toISOString();
  const imageMarkdown = generateImageMarkdown(images, product.model);
  
  return `---
title: 霍尼韦尔 ${product.model} ${product.name}
slug: ${product.model.toLowerCase()}
date: ${now}
updatedAt: ${now}
author: 湖北科信达机电设备有限公司技术部
category: ${product.category}
status: published
location: "湖北武汉"
seoTitle: 霍尼韦尔${product.model}_${product.name}_产品参数_湖北科信达
seoDescription: 湖北科信达为您详细介绍霍尼韦尔${product.model}${product.name}技术参数、规格型号及应用，霍尼韦尔阀门湖北官方授权代理商，正品保障。
keywords: 霍尼韦尔,${product.model},${product.type},${product.category}
canonical: https://www.hubeikexinda.online/products/${product.model.toLowerCase()}
relatedLinks: ["/selection-guide", "/contact"]

model: ${product.model}
brand: 霍尼韦尔
type: entity
productLine: ${product.line}
productType: ${product.type}
mediaType: ${product.media}
relatedEntities:
${product.related.map(r => `  - ${r.toLowerCase()}`).join('\n')}
relatedTopics:
  - valve-selection
  - actuator-selection
sources:
  - pdfs/霍尼韦尔暖通空调电动阀与执行器综合样册-2025.pdf
---

# 霍尼韦尔 ${product.model} ${product.name}

## 产品图片

${imageMarkdown}

## 产品概述

霍尼韦尔 ${product.model} ${product.name}是高品质的暖通空调控制阀门，适用于${product.media === 'steam' ? '蒸汽系统' : '中央空调系统和区域供热系统的冷热水控制'}，广泛应用于商业楼宇、医院、酒店等场所的暖通空调系统。

## 技术参数

| 参数 | 规格 |
|------|------|
| 产品型号 | ${product.model} |
| 产品名称 | ${product.name} |
| 承压等级 | ${product.pn} |
| 口径范围 | ${product.dnRange} |
| 阀体材质 | ${product.material} |
| 适用介质 | ${product.media === 'steam' ? '蒸汽（0°C ~ 180°C）、冷热水' : '冷热水（' + product.tempRange + '）'} |
| 流量特性 | ${product.flowChar} |
| 可调比 | ${product.turndown} |
| 泄漏率 | ${product.leakage} |
| 连接方式 | ${product.connection === 'thread' ? '螺纹连接（ISO7-1）' : '法兰连接（ISO7005-2）'} |
| 配套执行器 | ${product.actuator} |
| 行程 | ${product.stroke} |

## 产品特性

- 高品质材料制造，确保长期稳定运行
- 精确的流量控制性能
- 与霍尼韦尔执行器完美匹配
- 安装维护简便
- ${product.media === 'steam' ? '专为蒸汽系统设计，耐高温高压' : '适用于暖通空调水系统，性能稳定可靠'}

## 配套产品

${product.related.map(r => `- [[${r}]] 系列执行器`).join('\n')}

## 应用场景

适用于${product.media === 'steam' ? '蒸汽供热系统、工业蒸汽应用' : '中央空调系统和区域供热系统的冷热水控制'}，广泛应用于商业楼宇、医院、酒店、工业厂房等场所的暖通空调系统。

## 选型要点

1. 根据系统介质${product.media === 'steam' ? '（蒸汽）' : '（冷热水）'}选择对应的阀门系列
2. 根据管道口径选择对应的DN规格
3. 根据系统承压要求选择PN等级
4. 根据控制要求选择配套执行器型号
5. 如需详细选型指导，请联系我们的技术工程师

## 常见问题

**Q1: ${product.model}系列阀门可以用于${product.media === 'steam' ? '冷热水系统吗？**

A: 本系列专为蒸汽系统设计，如需冷热水系统应用，请选择V5011B2W或V5011S2W系列。' : '蒸汽系统吗？**

A: 本系列适用于冷热水系统，如需蒸汽系统应用，请选择V5011S2S或V5GV2S系列。'}

**Q2: 如何选择配套的执行器？**

A: 根据系统关闭压差要求选择执行器推力，关闭压差越大，需要推力越大的执行器。具体选型请咨询我们的技术工程师。

## 联系我们

如需了解更多 ${product.model} 系列产品信息，欢迎联系湖北科信达机电设备有限公司。

联系电话：13907117179
服务范围：湖北全省

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "霍尼韦尔 ${product.model} ${product.name}",
  "brand": {
    "@type": "Brand",
    "name": "霍尼韦尔"
  },
  "description": "湖北科信达为您详细介绍霍尼韦尔${product.model}${product.name}技术参数、规格型号及应用",
  "image": "https://www.hubeikexinda.online/images/products/${product.model.toLowerCase()}.png",
  "offers": {
    "@type": "Offer",
    "url": "https://www.hubeikexinda.online/products/${product.model.toLowerCase()}",
    "priceCurrency": "CNY",
    "availability": "https://schema.org/InStock"
  }
}
</script>
`;
}

// 主函数
function main() {
  console.log('🚀 开始生成产品详情 Markdown 文件...\n');
  
  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  let generatedCount = 0;
  let skippedCount = 0;
  
  PRODUCTS.forEach(product => {
    const images = getProductImages(product.model);
    
    if (images.length === 0) {
      console.log(`⚠️ 跳过 ${product.model}: 未找到产品图片`);
      skippedCount++;
      return;
    }
    
    const mdContent = generateProductMarkdown(product, images);
    const filePath = path.join(OUTPUT_DIR, `${product.model.toLowerCase()}.md`);
    
    fs.writeFileSync(filePath, mdContent, 'utf8');
    
    console.log(`✅ 生成: ${product.model}.md (${images.length} 张图片)`);
    generatedCount++;
  });
  
  console.log(`\n📊 完成统计:`);
  console.log(`   成功生成: ${generatedCount} 个产品详情文件`);
  console.log(`   跳过: ${skippedCount} 个产品`);
  console.log(`\n🎉 全部完成！`);
}

// 执行主函数
main();
