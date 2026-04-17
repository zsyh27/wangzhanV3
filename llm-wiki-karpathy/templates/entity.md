---
# SEO 字段（用于网站展示）
title: {产品系列名称，如：霍尼韦尔 V5011B2W 系列螺纹型电动座阀}
slug: {小写系列名，如：v5011b2w}
date: {当前ISO日期}
updatedAt: {当前ISO日期}                # 新增：最后更新时间（重要：影响时效性排名）
author: 湖北科信达机电设备有限公司技术部
category: {产品分类，如：电动座阀/执行器}
status: published
location: "湖北武汉"                    # 新增：服务地区（强化本地SEO）
seoTitle: 霍尼韦尔{系列名}_{分类}_产品参数_湖北科信达
seoDescription: 湖北科信达为您详细介绍霍尼韦尔{产品名}技术参数、特点及应用，霍尼韦尔阀门湖北官方授权代理商，正品保障。
keywords: {霍尼韦尔,{系列名},{产品类型},{相关关键词}}
canonical: https://www.hubeikexinda.online/products/{slug}  # 新增：规范URL，防止重复内容
relatedLinks: ["/selection-guide", "/contact"]  # 内部相关页面链接

# LLM Wiki 字段（用于知识管理）
model: {系列名，如：V5011B2W}
brand: 霍尼韦尔
type: entity                    # 必需：entity
productLine: {产品线，如：座阀/执行器}
productType: {产品类型，如：电动二通阀/直行程执行器}
mediaType: {适用介质，如：冷热水/蒸汽}
relatedEntities:                # 相关实体（双向链接）
  - {配套执行器或阀门，如：ml74}
  - {同系列其他产品，如：v5011b3w}
relatedTopics:                  # 相关主题
  - {相关技术主题，如：valve-selection}
sources:                        # 来源素材（必需）
  - pdfs/{PDF文件名}
---

# {产品系列名称}

## 产品图片

![霍尼韦尔{系列名}产品外观图](/images/products/{slug}.webp)
*霍尼韦尔{系列名}电动座阀外观图*

## 产品概述

{产品简介、应用场景概述}

## 技术参数

| 参数 | 规格 |
|------|------|
| {参数1} | {值1} |
| {参数2} | {值2} |

## 产品特性

- {特性1}
- {特性2}

## 配套产品

- [[{配套产品1}]] - {说明}
- [[{配套产品2}]] - {说明}

## 应用场景

### {场景1}

{详细说明}

## 选型要点

1. {要点1}
2. {要点2}

## 常见问题

**Q1: {问题}**

A: {答案}

## 联系我们

如需了解更多 {系列名} 系列产品信息，欢迎联系湖北科信达机电设备有限公司。

联系电话：13907117179
服务范围：湖北全省

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{产品系列名称}",
  "brand": {
    "@type": "Brand",
    "name": "霍尼韦尔"
  },
  "description": "{seoDescription}",
  "image": "https://www.hubeikexinda.online/images/products/{slug}.webp",
  "offers": {
    "@type": "Offer",
    "url": "https://www.hubeikexinda.online/products/{slug}",
    "priceCurrency": "CNY",
    "availability": "https://schema.org/InStock"
  }
}
</script>
