/**
 * 根据PDF参数和产品图片生成22个产品详情MD文件
 */

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products');
const OUTPUT_DIR = path.join(process.cwd(), 'content', 'products');

// 22个产品的详细参数（从PDF提取）
const PRODUCTS = [
  {
    model: 'V5011B2W', name: '螺纹型电动二通座阀', category: '电动座阀',
    params: { pn: 'PN16', dn: 'DN15-DN50', material: '黄铜 HPb59-1', temp: '-15°C ~ 130°C',
      media: '冷热水', flow: '等百分比', ratio: '50:1', leakage: '≤0.01% Kvs',
      actuator: 'ML74系列、ML8824系列', stroke: '20mm' },
    images: ['V5011B2W.png']
  },
  {
    model: 'V5011B3W', name: '螺纹型电动三通座阀', category: '电动座阀',
    params: { pn: 'PN16', dn: 'DN15-DN50', material: '黄铜 HPb59-1', temp: '-15°C ~ 130°C',
      media: '冷热水', flow: 'A→AB:等百分比；B→AB:线性', ratio: '50:1',
      leakage: 'A→AB:≤0.01% Kvs；B→AB:≤0.02% Kvs',
      actuator: 'ML74系列、ML8824系列', stroke: '10mm/15mm/20mm' },
    images: ['V5011B3W.png']
  },
  {
    model: 'V5011S2W', name: '螺纹型不锈钢电动座阀', category: '电动座阀',
    params: { pn: 'PN20', dn: 'DN15-DN50', material: '不锈钢 SS304', temp: '-25°C ~ 130°C',
      media: '冷热水', flow: '等百分比', ratio: '50:1', leakage: 'IV级≤0.01% Kvs',
      actuator: 'ML74系列、ML8824系列', stroke: '10mm/15mm/20mm' },
    images: ['V5011S2W.png']
  },
  {
    model: 'V5011S3W', name: '螺纹型不锈钢电动三通座阀', category: '电动座阀',
    params: { pn: 'PN20', dn: 'DN15-DN50', material: '不锈钢 SS304', temp: '-25°C ~ 130°C',
      media: '冷热水', flow: 'A→AB:等百分比；B→AB:线性', ratio: '50:1',
      leakage: 'A→AB:≤0.01% Kvs；B→AB:≤0.02% Kvs',
      actuator: 'ML74系列、ML8824系列', stroke: '10mm/15mm/20mm' },
    images: ['V5011S3W.png']
  },
  {
    model: 'V5GV2W', name: '法兰型电动二通座阀', category: '电动座阀',
    params: { pn: 'PN16', dn: 'DN15-DN150', material: '球墨铸铁 QT450-10', temp: '-15°C ~ 130°C',
      media: '冷热水', flow: '等百分比', ratio: '50:1', leakage: '≤0.02% Kvs',
      actuator: 'ML8824系列', stroke: '20mm/40mm' },
    images: ['V5GV2W.png']
  },
  {
    model: 'V5GV3W', name: '法兰型电动三通座阀', category: '电动座阀',
    params: { pn: 'PN16', dn: 'DN50-DN150', material: '球墨铸铁 QT450-10', temp: '-15°C ~ 130°C',
      media: '冷热水', flow: 'A→AB:等百分比；B→AB:线性', ratio: '50:1',
      leakage: 'A→AB:≤0.02% Kvs；B→AB:≤1% Kvs',
      actuator: 'ML8824系列', stroke: '20mm/40mm' },
    images: ['V5GV3W.png']
  },
  {
    model: 'V6GV', name: '法兰型电动座阀（大口径）', category: '电动座阀',
    params: { pn: 'PN16/PN25', dn: 'DN15-DN250', material: '球墨铸铁 QT450-10', temp: '-20°C ~ 150°C',
      media: '冷热水', flow: '等百分比', ratio: '50:1', leakage: 'IV级≤0.02% Kvs',
      actuator: 'ML8824/ML8624系列', stroke: '20mm/40mm/44mm' },
    images: ['V6GV.png']
  },
  {
    model: 'VH58', name: '法兰型电动三通座阀', category: '电动座阀',
    params: { pn: 'PN16', dn: 'DN65-DN250', material: '球墨铸铁 QT450-10', temp: '2°C ~ 130°C',
      media: '冷热水', flow: 'A→AB:等百分比；B→AB:线性', ratio: '50:1',
      leakage: '≤0.02% Kvs', actuator: 'ML8624系列', stroke: '20mm/40mm' },
    images: ['VH58.png']
  },
  {
    model: 'V5011S2S', name: '螺纹型电动蒸汽座阀', category: '电动座阀',
    params: { pn: 'PN20', dn: 'DN15-DN50', material: '不锈钢 SS304', temp: '0°C ~ 180°C',
      media: '蒸汽', flow: '等百分比', ratio: '50:1', leakage: 'IV-S级≤0.001% Kvs',
      actuator: 'ML8824系列', stroke: '10mm/15mm/20mm' },
    images: ['V5011S2S.png']
  },
  {
    model: 'V5GV2S', name: '法兰型电动蒸汽座阀', category: '电动座阀',
    params: { pn: 'PN16', dn: 'DN15-DN150', material: '球墨铸铁 QT450-10', temp: '0°C ~ 180°C',
      media: '蒸汽', flow: '等百分比', ratio: '50:1', leakage: 'IV-S级≤0.001% Kvs',
      actuator: 'ML8824系列', stroke: '20mm/40mm' },
    images: ['V5GV2S.png']
  },
  {
    model: 'ML74', name: '直行程电动执行器', category: '电动执行器',
    params: { pn: '-', dn: '-', material: '-', temp: '-10°C ~ +50°C',
      media: '-', flow: '-', ratio: '-', leakage: '-',
      actuator: '直行程600N/1800N', stroke: '20mm' },
    images: ['ML74.png']
  },
  {
    model: 'ML8824', name: '直行程电动执行器', category: '电动执行器',
    params: { pn: '-', dn: '-', material: '-', temp: '-10°C ~ +55°C',
      media: '-', flow: '-', ratio: '-', leakage: '-',
      actuator: '600N/1800N', stroke: '26mm/46mm' },
    images: ['ML8824.png']
  },
  {
    model: 'ML8624', name: '直行程电动执行器', category: '电动执行器',
    params: { pn: '-', dn: '-', material: '-', temp: '-10°C ~ +55°C',
      media: '-', flow: '-', ratio: '-', leakage: '-',
      actuator: '2500N/3500N', stroke: '44mm' },
    images: ['ML8624.png']
  },
  {
    model: 'MVN', name: '球阀电动执行器', category: '电动执行器',
    params: { pn: '-', dn: '-', material: '-', temp: '-',
      media: '-', flow: '-', ratio: '-', leakage: '-',
      actuator: '5/10/20/34Nm', stroke: '角行程90°' },
    images: ['MVN.png']
  },
  {
    model: 'NOM', name: '蝶阀电动执行器', category: '电动执行器',
    params: { pn: '-', dn: '-', material: '-', temp: '-',
      media: '-', flow: '-', ratio: '-', leakage: '-',
      actuator: '50-5000Nm', stroke: '角行程90°' },
    images: ['NOM.png']
  },
  {
    model: 'VBA16P', name: '螺纹型电动二通球阀', category: '电动球阀',
    params: { pn: 'PN16', dn: 'DN20-DN80', material: '黄铜 HPb59-1', temp: '-5°C ~ 120°C',
      media: '冷热水', flow: '等百分比', ratio: '50:1', leakage: 'Class IV≤0.01% Kvs',
      actuator: 'MVN系列', stroke: '90°角行程' },
    images: ['VBA16P.png']
  },
  {
    model: 'VBA16PE', name: '螺纹型电动二通球阀（经济型）', category: '电动球阀',
    params: { pn: 'PN16', dn: 'DN15-DN50', material: '黄铜 HPb59-1', temp: '-5°C ~ 120°C',
      media: '冷热水', flow: '等百分比', ratio: '50:1', leakage: 'Class IV≤0.01% Kvs',
      actuator: 'MVN系列', stroke: '90°角行程' },
    images: ['VBA16P..E.png']
  },
  {
    model: 'VBA16F', name: '法兰型电动二通球阀', category: '电动球阀',
    params: { pn: 'PN16', dn: 'DN65-DN150', material: '球墨铸铁 QT450-10', temp: '-5°C ~ 120°C',
      media: '冷热水', flow: '等百分比', ratio: '50:1', leakage: 'Class IV≤0.01% Kvs',
      actuator: 'MVN系列', stroke: '90°角行程' },
    images: ['VBA16F.png']
  },
  {
    model: 'VBF16E', name: '螺纹型电动三通球阀', category: '电动球阀',
    params: { pn: 'PN16', dn: 'DN15-DN50', material: '黄铜 HPb59-1', temp: '-5°C ~ 120°C',
      media: '冷热水', flow: '直通等百分比；旁通线性', ratio: '100:1',
      leakage: 'Class IV≤0.01% Kvs', actuator: 'MVN系列', stroke: '90°角行程' },
    images: ['VBF16..E和VBH16..E.png']
  },
  {
    model: 'V9BF', name: '电动蝶阀', category: '电动蝶阀',
    params: { pn: 'PN16', dn: 'DN50-DN800', material: '球墨铸铁 GGG40', temp: '-10°C ~ 120°C',
      media: '冷热水/乙二醇', flow: '-', ratio: '-', leakage: '零泄漏ISO5208',
      actuator: 'NOM16H系列', stroke: '90°角行程' },
    images: ['V9BF.png']
  },
  {
    model: 'V9BFW25', name: '电动蝶阀（PN25高压型）', category: '电动蝶阀',
    params: { pn: 'PN25', dn: 'DN50-DN600', material: '球墨铸铁 GGG40', temp: '-10°C ~ 120°C',
      media: '冷热水/乙二醇', flow: '-', ratio: '-', leakage: '零泄漏ISO5208',
      actuator: 'NOM25H系列', stroke: '90°角行程' },
    images: ['V9BFW25.png']
  },
  {
    model: 'V8BFS', name: '不锈钢电动蝶阀', category: '电动蝶阀',
    params: { pn: 'PN16', dn: 'DN50-DN800', material: '不锈钢 SS304', temp: '-10°C ~ 120°C',
      media: '冷热水/乙二醇', flow: '-', ratio: '-', leakage: '零泄漏ISO5208',
      actuator: 'NOM16H系列', stroke: '90°角行程' },
    images: ['V8BF..S.png']
  }
];

// 生成图片Markdown
function generateImagesMarkdown(images, model) {
  if (!images || images.length === 0) {
    return `![霍尼韦尔${model}产品图](/images/products/valve-1.svg)\n*霍尼韦尔${model}系列产品*`;
  }
  return images.map((img, idx) => 
    `![霍尼韦尔${model}产品图 ${idx + 1}](/images/products/${img})\n*霍尼韦尔${model}系列产品外观图 ${idx + 1}*`
  ).join('\n\n');
}

// 生成产品详情Markdown
function generateMarkdown(product) {
  const now = new Date().toISOString();
  const slug = product.model.toLowerCase().replace(/\s+/g, '');
  const isActuator = product.category === '电动执行器';
  
  let content = `---\ntitle: 霍尼韦尔 ${product.model} ${product.name}
slug: ${slug}\ndate: ${now}\nupdatedAt: ${now}\nauthor: 湖北科信达机电设备有限公司技术部\ncategory: ${product.category}\nstatus: published\nlocation: "湖北武汉"\nseoTitle: 霍尼韦尔${product.model}_${product.name}_产品参数_湖北科信达\nseoDescription: 湖北科信达为您详细介绍霍尼韦尔${product.model}${product.name}技术参数、规格型号及应用，霍尼韦尔阀门湖北官方授权代理商，正品保障。\nkeywords: 霍尼韦尔,${product.model},${product.category.replace('电动', '')},电动执行器\ncanonical: https://www.hubeikexinda.online/products/${slug}\nrelatedLinks: ["/selection-guide", "/contact"]\n\nmodel: ${product.model}\nbrand: 霍尼韦尔\ntype: entity\nproductLine: ${product.category.replace('电动', '')}\nproductType: ${product.name.replace(/（.*?）/g, '').trim()}\nmediaType: ${product.params.media === '蒸汽' ? 'steam' : 'cold-hot-water'}\nrelatedEntities: [\n  - valve-selection\n]\nrelatedTopics: [\n  - valve-selection\n]\nsources: [\n  - pdfs/霍尼韦尔暖通空调电动阀与执行器综合样册-2025.pdf\n]\n---\n\n# 霍尼韦尔 ${product.model} ${product.name}\n\n## 产品图片\n\n${generateImagesMarkdown(product.images, product.model)}\n\n## 产品概述\n\n`;

  // 概述部分
  if (isActuator) {
    content += `霍尼韦尔 ${product.model} ${product.name}是霍尼韦尔暖通空调系统的重要组成部分，`;
    if (product.model.includes('ML')) {
      content += `专为直行程阀门设计，提供精确的推力控制，适用于座阀的精确调节。`;
    } else if (product.model.includes('MVN')) {
      content += `专为球阀设计，提供扭矩输出，适用于VBA系列球阀的开关和调节控制。`;
    } else {
      content += `专为蝶阀设计，提供大扭矩输出，适用于V9BF系列蝶阀的开关和调节控制。`;
    }
  } else {
    content += `霍尼韦尔 ${product.model} ${product.name}是高品质的暖通空调控制阀门，`;
    if (product.params.media === '蒸汽') {
      content += `专为蒸汽系统设计，采用耐高温高压材料，适用于蒸汽供热系统。`;
    } else {
      content += `适用于中央空调系统和区域供热系统的冷热水控制，广泛应用于商业楼宇、医院、酒店等场所的暖通空调系统。`;
    }
  }
  
  content += `\n\n## 技术参数\n\n| 参数 | 规格 |\n|------|------|\n`;
  
  if (!isActuator) {
    content += `| 产品型号 | ${product.model} |\n| 产品名称 | ${product.name} |\n| 承压等级 | ${product.params.pn} |\n| 口径范围 | ${product.params.dn} |\n| 阀体材质 | ${product.params.material} |\n| 适用介质 | ${product.params.media}（${product.params.temp}） |\n| 流量特性 | ${product.params.flow} |\n`;
    if (product.params.ratio !== '-') {
      content += `| 可调比 | ${product.params.ratio} |\n`;
    }
    content += `| 泄漏率 | ${product.params.leakage} |\n`;
    content += `| 连接方式 | ${product.params.dn.includes('螺纹') || product.params.pn === 'PN20' ? '螺纹连接' : '法兰连接'} |\n`;
  }
  
  if (product.params.actuator !== '-') {
    content += `| ${isActuator ? '推力/扭矩' : '配套执行器'} | ${product.params.actuator} |\n`;
  }
  content += `| ${isActuator ? '额定行程' : '行程'} | ${product.params.stroke} |\n`;
  
  content += `\n## 产品特性\n\n- 高品质材料制造，确保长期稳定运行\n`;
  
  if (!isActuator) {
    content += `- 精确的流量控制性能\n- 与霍尼韦尔执行器完美匹配\n`;
  } else {
    content += `- 高精度位置控制\n- 与霍尼韦尔阀门完美匹配\n`;
  }
  
  content += `- 安装维护简便\n`;
  
  if (!isActuator && product.params.media === '蒸汽') {
    content += `- 专为蒸汽系统设计，耐高温高压\n`;
  } else if (!isActuator) {
    content += `- 适用于暖通空调水系统，性能稳定可靠\n`;
  }
  
  content += `\n## 应用场景\n\n`;
  
  if (isActuator) {
    if (product.model.includes('ML74') || product.model.includes('ML8824')) {
      content += `适用于座阀的驱动控制，广泛应用于中央空调系统、区域供热系统、工业过程控制等领域。与V5011系列、V5GV系列、V6GV系列等座阀配套使用。`;
    } else if (product.model.includes('MVN')) {
      content += `适用于球阀的驱动控制，广泛应用于暖通空调水系统、工业过程控制等领域。与VBA16P系列、VBA16F系列球阀配套使用。`;
    } else {
      content += `适用于蝶阀的驱动控制，广泛应用于大型暖通空调系统、水厂、污水处理厂等领域。与V9BF系列蝶阀配套使用。`;
    }
  } else {
    if (product.params.media === '蒸汽') {
      content += `适用于蒸汽供热系统、工业蒸汽应用，如医院消毒、工业生产等场景。`;
    } else if (product.model.includes('VBA') || product.model.includes('VBF')) {
      content += `适用于暖通空调水系统的流量调节和控制，广泛应用于商业楼宇、医院、酒店等场所。`;
    } else if (product.model.includes('V9BF') || product.model.includes('V8BF')) {
      content += `适用于大型暖通空调水系统、水厂、污水处理厂等大口径管道系统的流量控制。`;
    } else {
      content += `适用于中央空调系统和区域供热系统的冷热水控制，广泛应用于商业楼宇、医院、酒店、工业厂房等场所的暖通空调系统。`;
    }
  }
  
  content += `\n\n## 选型要点\n\n`;
  
  if (isActuator) {
    content += `1. 根据配套阀门的类型选择执行器系列\n2. 根据阀门所需的推力/扭矩选择执行器型号\n3. 根据控制要求选择开关型或调节型\n4. 根据电源要求选择24VAC/DC或230VAC\n`;
  } else {
    content += `1. 根据系统介质${product.params.media === '蒸汽' ? '（蒸汽）' : '（冷热水）'}选择对应的阀门系列\n2. 根据管道口径选择对应的DN规格\n3. 根据系统承压要求选择PN等级\n4. 根据控制要求选择配套执行器型号\n`;
  }
  
  content += `5. 如需详细选型指导，请联系我们的技术工程师\n\n## 常见问题\n\n`;
  
  if (product.params.media === '蒸汽') {
    content += `**Q1: ${product.model}系列阀门可以用于冷热水系统吗？**\n\nA: 本系列专为蒸汽系统设计，如需冷热水系统应用，请选择V5011B2W或V5011S2W系列。\n\n`;
  } else if (!isActuator && product.model.includes('V5011') && !product.model.includes('S2S')) {
    content += `**Q1: ${product.model}系列阀门可以用于蒸汽系统吗？**\n\nA: 本系列适用于冷热水系统，如需蒸汽系统应用，请选择V5011S2S或V5GV2S系列。\n\n`;
  }
  
  content += `**Q${product.params.media === '蒸汽' || isActuator ? '1' : '2'}: 如何选择${isActuator ? '配套阀门' : '配套的执行器'}？**\n\nA: 根据系统${isActuator ? '流量和压差' : '关闭压差'}要求选择${isActuator ? '阀门规格' : '执行器推力'}，${isActuator ? '关闭压差越大，需要推力越大的执行器' : '执行器推力越大，可承受的关闭压差越大'}。具体选型请咨询我们的技术工程师。\n\n## 联系我们\n\n如需了解更多 ${product.model} 系列产品信息，欢迎联系湖北科信达机电设备有限公司。\n\n联系电话：13907117179\n服务范围：湖北全省\n\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Product",\n  "name": "霍尼韦尔 ${product.model} ${product.name}",\n  "brand": {\n    "@type": "Brand",\n    "name": "霍尼韦尔"\n  },\n  "description": "湖北科信达为您详细介绍霍尼韦尔${product.model}${product.name}技术参数、规格型号及应用",\n  "image": "https://www.hubeikexinda.online/images/products/${product.images[0] || 'valve-1.svg'}",\n  "offers": {\n    "@type": "Offer",\n    "url": "https://www.hubeikexinda.online/products/${slug}",\n    "priceCurrency": "CNY",\n    "availability": "https://schema.org/InStock"\n  }\n}\n</script>\n`;
  
  return content;
}

// 主函数
function main() {
  console.log('🚀 开始生成22个产品详情Markdown文件...\n');
  
  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  let generatedCount = 0;
  let skippedCount = 0;
  
  PRODUCTS.forEach(product => {
    const slug = product.model.toLowerCase().replace(/\s+/g, '');
    const filePath = path.join(OUTPUT_DIR, `${slug}.md`);
    
    // 检查图片是否存在
    const hasImages = product.images.every(img => 
      fs.existsSync(path.join(IMAGES_DIR, img))
    );
    
    if (!hasImages) {
      console.log(`⚠️ 跳过 ${product.model}: 图片文件缺失`);
      console.log(`   需要: ${product.images.join(', ')}`);
      skippedCount++;
      return;
    }
    
    const mdContent = generateMarkdown(product);
    fs.writeFileSync(filePath, mdContent, 'utf8');
    
    console.log(`✅ 生成: ${slug}.md (${product.images.length} 张图片)`);
    generatedCount++;
  });
  
  console.log(`\n📊 完成统计:`);
  console.log(`   成功生成: ${generatedCount} 个产品详情文件`);
  console.log(`   跳过: ${skippedCount} 个产品`);
  console.log(`\n🎉 全部完成！`);
}

// 执行
main();
