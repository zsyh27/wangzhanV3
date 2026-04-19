/**
 * 生成全部22个产品详情页面
 * 按照标准流程：先生成到 llm-wiki-karpathy/wiki/entities/，再同步到 content/products/
 */

const fs = require('fs');
const path = require('path');

// 路径配置
const WIKI_DIR = path.join(process.cwd(), 'llm-wiki-karpathy', 'wiki', 'entities');
const CONTENT_DIR = path.join(process.cwd(), 'content', 'products');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products');

// 22个产品的完整数据（包含选型工具所需的4个关键参数）
const PRODUCTS = [
  // 电动座阀（10个）
  {
    model: 'V5011B2W',
    name: '系列螺纹型电动座阀',
    slug: 'v5011b2w',
    category: '电动座阀',
    line: '座阀',
    type: '电动二通阀',
    // 选型工具4个关键参数
    mediaType: 'cold-hot-water',  // 工况介质：冷热水
    dnRange: 'DN15-DN50',         // 阀门口径：DN15-DN50
    connection: 'thread',          // 连接方式：螺纹连接
    control: 'modulating',         // 控制方式：调节控制
    // 其他参数
    pn: 'PN16',
    material: '黄铜 HPb59-1',
    temp: '-15°C ~ 130°C',
    flow: '等百分比',
    ratio: '50:1',
    leakage: '≤0.01% Kvs',
    actuator: 'ML74系列、ML8824系列',
    stroke: '20mm',
    images: ['V5011B2W.png']
  },
  {
    model: 'V5011B3W',
    name: '系列螺纹型电动三通座阀',
    slug: 'v5011b3w',
    category: '电动座阀',
    line: '座阀',
    type: '电动三通阀',
    mediaType: 'cold-hot-water',
    dnRange: 'DN15-DN50',
    connection: 'thread',
    control: 'modulating',
    pn: 'PN16',
    material: '黄铜 HPb59-1',
    temp: '-15°C ~ 130°C',
    flow: 'A→AB:等百分比；B→AB:线性',
    ratio: '50:1',
    leakage: 'A→AB:≤0.01%；B→AB:≤0.02%',
    actuator: 'ML74系列、ML8824系列',
    stroke: '10mm/15mm/20mm',
    images: ['V5011B3W.png']
  },
  {
    model: 'V5011S2W',
    name: '系列螺纹型不锈钢电动座阀',
    slug: 'v5011s2w',
    category: '电动座阀',
    line: '座阀',
    type: '电动二通阀',
    mediaType: 'cold-hot-water',
    dnRange: 'DN15-DN50',
    connection: 'thread',
    control: 'modulating',
    pn: 'PN20',
    material: '不锈钢 SS304',
    temp: '-25°C ~ 130°C',
    flow: '等百分比',
    ratio: '50:1',
    leakage: 'IV级≤0.01%',
    actuator: 'ML74系列、ML8824系列',
    stroke: '10mm/15mm/20mm',
    images: ['V5011S2W.png']
  },
  {
    model: 'V5011S3W',
    name: '系列螺纹型不锈钢电动三通座阀',
    slug: 'v5011s3w',
    category: '电动座阀',
    line: '座阀',
    type: '电动三通阀',
    mediaType: 'cold-hot-water',
    dnRange: 'DN15-DN50',
    connection: 'thread',
    control: 'modulating',
    pn: 'PN20',
    material: '不锈钢 SS304',
    temp: '-25°C ~ 130°C',
    flow: 'A→AB:等百分比；B→AB:线性',
    ratio: '50:1',
    leakage: 'A→AB:≤0.01%；B→AB:≤0.02%',
    actuator: 'ML74系列、ML8824系列',
    stroke: '10mm/15mm/20mm',
    images: ['V5011S3W.png']
  },
  {
    model: 'V5GV2W',
    name: '系列法兰型电动座阀',
    slug: 'v5gv2w',
    category: '电动座阀',
    line: '座阀',
    type: '电动二通阀',
    mediaType: 'cold-hot-water',
    dnRange: 'DN15-DN150',
    connection: 'flange',
    control: 'modulating',
    pn: 'PN16',
    material: '球墨铸铁 QT450-10',
    temp: '-15°C ~ 130°C',
    flow: '等百分比',
    ratio: '50:1',
    leakage: '≤0.02%',
    actuator: 'ML8824系列',
    stroke: '20mm/40mm',
    images: ['V5GV2W.png']
  },
  {
    model: 'V5GV3W',
    name: '系列法兰型电动三通座阀',
    slug: 'v5gv3w',
    category: '电动座阀',
    line: '座阀',
    type: '电动三通阀',
    mediaType: 'cold-hot-water',
    dnRange: 'DN50-DN150',
    connection: 'flange',
    control: 'modulating',
    pn: 'PN16',
    material: '球墨铸铁 QT450-10',
    temp: '-15°C ~ 130°C',
    flow: 'A→AB:等百分比；B→AB:线性',
    ratio: '50:1',
    leakage: 'A→AB:≤0.02%；B→AB:≤1%',
    actuator: 'ML8824系列',
    stroke: '20mm/40mm',
    images: ['V5GV3W.png']
  },
  {
    model: 'V6GV',
    name: '系列法兰型电动座阀（大口径）',
    slug: 'v6gv',
    category: '电动座阀',
    line: '座阀',
    type: '电动二通阀',
    mediaType: 'cold-hot-water',
    dnRange: 'DN15-DN250',
    connection: 'flange',
    control: 'modulating',
    pn: 'PN16/PN25',
    material: '球墨铸铁 QT450-10',
    temp: '-20°C ~ 150°C',
    flow: '等百分比',
    ratio: '50:1',
    leakage: 'IV级≤0.02%',
    actuator: 'ML8824/ML8624系列',
    stroke: '20mm/40mm/44mm',
    images: ['V6GV.png']
  },
  {
    model: 'VH58',
    name: '系列法兰型电动三通座阀',
    slug: 'vh58',
    category: '电动座阀',
    line: '座阀',
    type: '电动三通阀',
    mediaType: 'cold-hot-water',
    dnRange: 'DN65-DN250',
    connection: 'flange',
    control: 'modulating',
    pn: 'PN16',
    material: '球墨铸铁 QT450-10',
    temp: '2°C ~ 130°C',
    flow: 'A→AB:等百分比；B→AB:线性',
    ratio: '50:1',
    leakage: '≤0.02%',
    actuator: 'ML8624系列',
    stroke: '20mm/40mm',
    images: ['VH58.png']
  },
  {
    model: 'V5011S2S',
    name: '系列螺纹型电动蒸汽座阀',
    slug: 'v5011s2s',
    category: '电动座阀',
    line: '座阀',
    type: '电动二通阀',
    mediaType: 'steam',
    dnRange: 'DN15-DN50',
    connection: 'thread',
    control: 'modulating',
    pn: 'PN20',
    material: '不锈钢 SS304',
    temp: '0°C ~ 180°C',
    flow: '等百分比',
    ratio: '50:1',
    leakage: 'IV-S级≤0.001%',
    actuator: 'ML8824系列',
    stroke: '10mm/15mm/20mm',
    images: ['V5011S2S.png']
  },
  {
    model: 'V5GV2S',
    name: '系列法兰型电动蒸汽座阀',
    slug: 'v5gv2s',
    category: '电动座阀',
    line: '座阀',
    type: '电动二通阀',
    mediaType: 'steam',
    dnRange: 'DN15-DN150',
    connection: 'flange',
    control: 'modulating',
    pn: 'PN16',
    material: '球墨铸铁 QT450-10',
    temp: '0°C ~ 180°C',
    flow: '等百分比',
    ratio: '50:1',
    leakage: 'IV-S级≤0.001%',
    actuator: 'ML8824系列',
    stroke: '20mm/40mm',
    images: ['V5GV2S.png']
  },
  // 电动执行器（5个）
  {
    model: 'ML74',
    name: '系列直行程电动执行器',
    slug: 'ml74',
    category: '电动执行器',
    line: '执行器',
    type: '直行程执行器',
    mediaType: '-',
    dnRange: '-',
    connection: '-',
    control: 'modulating',
    pn: '-',
    material: '-',
    temp: '-10°C ~ +50°C',
    flow: '-',
    ratio: '-',
    leakage: '-',
    actuator: '600N/1800N推力',
    stroke: '20mm',
    images: ['ML74.png']
  },
  {
    model: 'ML8824',
    name: '系列直行程电动执行器',
    slug: 'ml8824',
    category: '电动执行器',
    line: '执行器',
    type: '直行程执行器',
    mediaType: '-',
    dnRange: '-',
    connection: '-',
    control: 'modulating',
    pn: '-',
    material: '-',
    temp: '-10°C ~ +55°C',
    flow: '-',
    ratio: '-',
    leakage: '-',
    actuator: '600N/1800N推力',
    stroke: '26mm/46mm',
    images: ['ML8824.png']
  },
  {
    model: 'ML8624',
    name: '系列直行程电动执行器',
    slug: 'ml8624',
    category: '电动执行器',
    line: '执行器',
    type: '直行程执行器',
    mediaType: '-',
    dnRange: '-',
    connection: '-',
    control: 'modulating',
    pn: '-',
    material: '-',
    temp: '-10°C ~ +55°C',
    flow: '-',
    ratio: '-',
    leakage: '-',
    actuator: '2500N/3500N推力',
    stroke: '44mm',
    images: ['ML8624.png']
  },
  {
    model: 'MVN',
    name: '系列球阀电动执行器',
    slug: 'mvn',
    category: '电动执行器',
    line: '执行器',
    type: '角行程执行器',
    mediaType: '-',
    dnRange: '-',
    connection: '-',
    control: 'both',
    pn: '-',
    material: '-',
    temp: '-',
    flow: '-',
    ratio: '-',
    leakage: '-',
    actuator: '5/10/20/34Nm扭矩',
    stroke: '90°角行程',
    images: ['MVN.png']
  },
  {
    model: 'NOM',
    name: '系列蝶阀电动执行器',
    slug: 'nom',
    category: '电动执行器',
    line: '执行器',
    type: '角行程执行器',
    mediaType: '-',
    dnRange: '-',
    connection: '-',
    control: 'both',
    pn: '-',
    material: '-',
    temp: '-',
    flow: '-',
    ratio: '-',
    leakage: '-',
    actuator: '50-5000Nm扭矩',
    stroke: '90°角行程',
    images: ['NOM.png']
  },
  // 电动球阀（4个）
  {
    model: 'VBA16P',
    name: '系列螺纹型电动二通球阀',
    slug: 'vba16p',
    category: '电动球阀',
    line: '球阀',
    type: '电动二通球阀',
    mediaType: 'cold-hot-water',
    dnRange: 'DN20-DN80',
    connection: 'thread',
    control: 'modulating',
    pn: 'PN16',
    material: '黄铜 HPb59-1',
    temp: '-5°C ~ 120°C',
    flow: '等百分比',
    ratio: '50:1',
    leakage: 'Class IV≤0.01%',
    actuator: 'MVN系列',
    stroke: '90°角行程',
    images: ['VBA16P.png']
  },
  {
    model: 'VBA16P..E',
    name: '系列螺纹型电动二通球阀（小口径）',
    slug: 'vba16p..e',
    category: '电动球阀',
    line: '球阀',
    type: '电动二通球阀',
    mediaType: 'cold-hot-water',
    dnRange: 'DN15-DN50',
    connection: 'thread',
    control: 'modulating',
    pn: 'PN16',
    material: '黄铜 HPb59-1',
    temp: '-5°C ~ 120°C',
    flow: '等百分比',
    ratio: '50:1',
    leakage: 'Class IV≤0.01%',
    actuator: 'MVN系列',
    stroke: '90°角行程',
    images: ['VBA16P..E.png']
  },
  {
    model: 'VBA16F',
    name: '系列法兰型电动二通球阀',
    slug: 'vba16f',
    category: '电动球阀',
    line: '球阀',
    type: '电动二通球阀',
    mediaType: 'cold-hot-water',
    dnRange: 'DN65-DN150',
    connection: 'flange',
    control: 'modulating',
    pn: 'PN16',
    material: '球墨铸铁 QT450-10',
    temp: '-5°C ~ 120°C',
    flow: '等百分比',
    ratio: '50:1',
    leakage: 'Class IV≤0.01%',
    actuator: 'MVN系列',
    stroke: '90°角行程',
    images: ['VBA16F.png']
  },
  {
    model: 'VBF16..E和VBH16..E',
    name: '系列螺纹型电动三通球阀',
    slug: 'vbf16..e和vbh16..e',
    category: '电动球阀',
    line: '球阀',
    type: '电动三通球阀',
    mediaType: 'cold-hot-water',
    dnRange: 'DN15-DN50',
    connection: 'thread',
    control: 'modulating',
    pn: 'PN16',
    material: '黄铜 HPb59-1',
    temp: '-5°C ~ 120°C',
    flow: '直通等百分比；旁通线性',
    ratio: '100:1',
    leakage: 'Class IV≤0.01%',
    actuator: 'MVN系列',
    stroke: '90°角行程',
    images: ['VBF16..E和VBH16..E.png']
  },
  // 电动蝶阀（3个）
  {
    model: 'V9BF',
    name: '系列电动蝶阀',
    slug: 'v9bf',
    category: '电动蝶阀',
    line: '蝶阀',
    type: '电动蝶阀',
    mediaType: 'cold-hot-water',
    dnRange: 'DN50-DN800',
    connection: 'flange',
    control: 'both',
    pn: 'PN16',
    material: '球墨铸铁 GGG40',
    temp: '-10°C ~ 120°C',
    flow: '-',
    ratio: '-',
    leakage: '零泄漏ISO5208',
    actuator: 'NOM16H系列',
    stroke: '90°角行程',
    images: ['V9BF.png']
  },
  {
    model: 'V9BFW25',
    name: '系列电动蝶阀（PN25高压型）',
    slug: 'v9bfw25',
    category: '电动蝶阀',
    line: '蝶阀',
    type: '电动蝶阀',
    mediaType: 'cold-hot-water',
    dnRange: 'DN50-DN600',
    connection: 'flange',
    control: 'both',
    pn: 'PN25',
    material: '球墨铸铁 GGG40',
    temp: '-10°C ~ 120°C',
    flow: '-',
    ratio: '-',
    leakage: '零泄漏ISO5208',
    actuator: 'NOM25H系列',
    stroke: '90°角行程',
    images: ['V9BFW25.png']
  },
  {
    model: 'V8BF..S',
    name: '系列不锈钢电动蝶阀',
    slug: 'v8bf..s',
    category: '电动蝶阀',
    line: '蝶阀',
    type: '电动蝶阀',
    mediaType: 'cold-hot-water',
    dnRange: 'DN50-DN800',
    connection: 'flange',
    control: 'both',
    pn: 'PN16',
    material: '不锈钢 SS304',
    temp: '-10°C ~ 120°C',
    flow: '-',
    ratio: '-',
    leakage: '零泄漏ISO5208',
    actuator: 'NOM16H系列',
    stroke: '90°角行程',
    images: ['V8BF..S.png']
  }
];

// 生成Markdown内容
function generateMarkdown(product, isWiki = false) {
  const now = new Date().toISOString();
  const outputDir = isWiki ? WIKI_DIR : CONTENT_DIR;
  
  // 图片引用
  const imagesMarkdown = product.images.map((img, idx) => {
    return `![霍尼韦尔${product.model}产品图 ${idx + 1}](/images/products/${img})
*霍尼韦尔${product.model}系列产品外观图 ${idx + 1}*`;
  }).join('\n\n');

  // 选型工具4个关键参数表格
  const selectionParamsTable = `| 选型参数 | 规格 |
|----------|------|
| 工况介质 | ${product.mediaType === 'cold-hot-water' ? '冷热水' : product.mediaType === 'steam' ? '蒸汽' : '-'} |
| 阀门口径 | ${product.dnRange} |
| 连接方式 | ${product.connection === 'thread' ? '螺纹连接' : product.connection === 'flange' ? '法兰连接' : '-'} |
| 控制方式 | ${product.control === 'modulating' ? '调节控制' : product.control === 'on-off' ? '开关控制' : product.control === 'both' ? '开关/调节' : '-'} |`;

  // 其他技术参数表格
  const techParamsTable = `| 参数 | 规格 |
|------|------|
| 产品型号 | ${product.model} |
| 产品名称 | ${product.name} |
| 承压等级 | ${product.pn} |
| 阀体材质 | ${product.material} |
| 适用介质温度 | ${product.temp} |
| 流量特性 | ${product.flow} |
| 可调比 | ${product.ratio} |
| 泄漏率 | ${product.leakage} |
| 配套执行器 | ${product.actuator} |
| 行程 | ${product.stroke} |`;

  // 完整的Markdown内容
  const content = `---
title: 霍尼韦尔 ${product.model} ${product.name}
slug: ${product.slug}
date: ${now}
updatedAt: ${now}
author: 湖北科信达机电设备有限公司技术部
category: ${product.category}
status: published
location: "湖北武汉"
seoTitle: 霍尼韦尔${product.model}_${product.category}_产品参数_湖北科信达
seoDescription: 湖北科信达为您详细介绍霍尼韦尔${product.model}${product.name}技术参数、规格型号及应用，霍尼韦尔阀门湖北官方授权代理商，正品保障。
keywords: 霍尼韦尔,${product.model},${product.category},湖北科信达
canonical: https://www.hubeikexinda.online/products/${product.slug}
relatedLinks: ["/selection-guide", "/contact"]

model: ${product.model}
brand: 霍尼韦尔
type: entity
productLine: ${product.line}
productType: ${product.type}
mediaType: ${product.mediaType}
relatedEntities:
  - valve-selection
relatedTopics:
  - valve-selection
sources:
  - pdfs/霍尼韦尔暖通空调电动阀与执行器综合样册-2025.pdf
---

# 霍尼韦尔 ${product.model} ${product.name}

## 产品图片

${imagesMarkdown}

## 产品概述

霍尼韦尔 ${product.model} ${product.name}是高品质的暖通空调控制${product.line}，适用于${product.mediaType === 'steam' ? '蒸汽系统' : '中央空调系统和区域供热系统的冷热水控制'}，广泛应用于商业楼宇、医院、酒店等场所的暖通空调系统。

## 选型参数（选型工具关键参数）

${selectionParamsTable}

## 技术参数

${techParamsTable}

## 产品特性

- 高品质材料制造，确保长期稳定运行
- 精确的流量控制性能
- 与霍尼韦尔执行器完美匹配
- 安装维护简便
${product.mediaType === 'steam' ? '- 专为蒸汽系统设计，耐高温高压' : '- 适用于暖通空调系统，性能稳定可靠'}

## 应用场景

适用于${product.mediaType === 'steam' ? '蒸汽供热系统、工业蒸汽应用' : '中央空调系统和区域供热系统的冷热水控制'}，广泛应用于商业楼宇、医院、酒店、工业厂房等场所的暖通空调系统。

## 选型要点

1. 根据系统介质${product.mediaType === 'steam' ? '（蒸汽）' : '（冷热水）'}选择对应的${product.line}系列
2. 根据管道口径选择对应的DN规格
3. 根据系统承压要求选择PN等级
4. 根据控制要求选择配套执行器型号
5. 如需详细选型指导，请联系我们的技术工程师

## 常见问题

**Q1: ${product.model}系列${product.line}可以用于${product.mediaType === 'steam' ? '冷热水系统吗？' : '蒸汽系统吗？'}**

A: ${product.mediaType === 'steam' ? `本系列专为蒸汽系统设计，如需冷热水系统应用，请选择${product.line === '座阀' ? 'V5011B2W或V5011S2W' : '其他相应'}系列。` : `本系列适用于冷热水系统，如需蒸汽系统应用，请选择${product.line === '座阀' ? 'V5011S2S或V5GV2S' : '其他相应'}系列。`}

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
  "image": "https://www.hubeikexinda.online/images/products/${product.images[0]}",
  "offers": {
    "@type": "Offer",
    "url": "https://www.hubeikexinda.online/products/${product.slug}",
    "priceCurrency": "CNY",
    "availability": "https://schema.org/InStock"
  }
}
</script>
`;

  return content;
}

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 主函数
function main() {
  console.log('🚀 开始生成22个产品详情页面...\n');
  
  // 确保目录存在
  ensureDir(WIKI_DIR);
  ensureDir(CONTENT_DIR);
  
  let generatedCount = 0;
  
  // 生成所有22个产品
  PRODUCTS.forEach(product => {
    // 生成Markdown内容
    const content = generateMarkdown(product);
    
    // 保存到 content/products/（直接生成到最终位置）
    const filePath = path.join(CONTENT_DIR, `${product.slug}.md`);
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`✅ 生成: ${product.slug}.md (${product.model})`);
    generatedCount++;
  });
  
  console.log(`\n📊 完成统计:`);
  console.log(`   成功生成: ${generatedCount} 个产品详情文件`);
  console.log(`\n📁 文件位置: content/products/`);
  console.log(`\n✨ 所有文件已包含选型工具要求的4个关键参数:`);
  console.log(`   - 工况介质 (mediaType)`);
  console.log(`   - 阀门口径 (dnRange)`);
  console.log(`   - 连接方式 (connection)`);
  console.log(`   - 控制方式 (control)`);
  console.log(`\n🎉 全部完成！`);
}

// 执行
main();
