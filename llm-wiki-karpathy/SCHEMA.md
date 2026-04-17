# LLM Wiki - 知识库结构规范

## 概述

本知识库遵循 Karpathy LLM Wiki 架构模式，采用三层结构：

- **raw/** - 原始素材（只读，不可修改）
- **wiki/** - AI 编译生成的知识文章（可读写）
- **SCHEMA.md** - 本文档，定义知识库结构和规范

## 目录结构

```
llm-wiki-karpathy/
├── raw/                           # 原始素材（只读，不可修改）
│   ├── pdfs/                      # PDF 文档
│   ├── articles/                  # 网页文章（Obsidian Web Clipper 剪藏）
│   ├── wechat/                    # 微信公众号文章
│   ├── notes/                     # 手动笔记
│   └── assets/                    # 图片等附件
│
├── wiki/                          # AI 编译的知识库（LLM 拥有，人类可读）
│   ├── entities/                  # 实体页（产品型号、执行器型号）
│   ├── topics/                    # 主题页（技术概念、应用场景）
│   ├── explorations/              # 查询分析归档
│   ├── decisions/                 # 技术决策记录
│   ├── drafts/                    # 草稿
│   ├── sources/                   # 素材摘要页（raw/ 的摘要）
│   ├── index.md                   # 内容索引（自动维护）
│   ├── _schema.md                 # 架构规范
│   └── log.md                     # 操作日志（自动维护）
│
├── manifests/                     # 素材清单
│   └── raw-sources.csv          # 原始素材清单
│
├── lib/                          # 核心库
│   ├── manifest-manager.js        # 素材清单管理
│   └── stale-detector.js         # 陈旧内容检测
│
├── scripts/                       # 知识处理脚本
│   ├── ingest.js                  # 智能摄入脚本（⚠️ 当前推荐使用 Trae AI）
│   ├── query.js                   # 知识查询脚本
│   ├── lint.js                    # 知识健康检查脚本
│   ├── update-index.js            # 索引更新脚本
│   ├── knowledge-sync.js          # 同步到 content/ 目录
│   ├── parse-pdf.js               # PDF 解析
│   ├── create-exploration.js      # 创建 exploration 页面
│   ├── create-decision.js         # 创建 decision 页面
│   ├── stale-report.js            # 陈旧内容检测
│   ├── delta-compile.js           # 增量编译
│   └── ...
│
├── templates/                     # 页面模板
│   ├── exploration.md             # exploration 页面模板
│   ├── decision.md                # decision 页面模板
│   └── rule.md                   # rule 页面模板
│
├── .cursorrules                  # Cursor IDE / Trae 配置
├── CLAUDE.md                    # Claude Code / Trae 配置
├── QUICK_REFERENCE.md           # 快速参考指南
├── README.md                      # 项目 README
└── SCHEMA.md                      # 本文档
```

## raw/ 目录规范

存放所有原始素材文件，按来源分类：

| 目录 | 用途 | 示例 |
|------|------|------|
| `pdfs/` | PDF 产品手册、技术规格 | 霍尼韦尔产品样册 |
| `articles/` | 网页文章（Obsidian Web Clipper 剪藏） | 行业技术文章 |
| `wechat/` | 微信公众号文章 | 霍尼韦尔官方推文 |
| `notes/` | 手动笔记 | 会议纪要、技术笔记 |
| `assets/` | 图片、图表等附件 | 产品图片、安装图 |

**命名规范**：`{文档名称}-{版本}.{扩展名}`

- 示例：`霍尼韦尔暖通空调电动阀与执行器综合样册-2025.pdf`

**重要**：`raw/` 目录中的文件是**只读**的，永远不要直接修改！

## wiki/ 目录规范

### wiki/entities/ — 实体页

产品型号、执行器型号等具体实体的详细页面。

**Frontmatter 规范**：
```yaml
---
# SEO 字段（保留，用于网站展示）
title: 霍尼韦尔 V5011B2W 系列螺纹型电动座阀
slug: v5011b2w
date: 2026-04-12T00:00:00.000Z
updatedAt: 2026-04-12T00:00:00.000Z      # 新增：最后更新时间（重要：影响时效性排名）
author: 湖北科信达机电设备有限公司技术部
category: 电动座阀
status: published
location: "湖北武汉"                      # 新增：服务地区（强化本地SEO）
seoTitle: 霍尼韦尔V5011B2W_螺纹型电动座阀_产品参数_湖北科信达
seoDescription: 湖北科信达为您详细介绍霍尼韦尔V5011B2W系列...
keywords: '霍尼韦尔阀门,V5011B2W,螺纹型电动座阀...'
canonical: https://www.hubeikexinda.online/products/v5011b2w  # 新增：规范URL，防止重复内容
relatedLinks: ["/selection-guide", "/contact"]  # 内部相关页面链接

# LLM Wiki 字段（新增，用于知识管理）
model: V5011B2W                    # 产品型号
brand: 霍尼韦尔                    # 品牌
type: entity                       # 类型：entity
productLine: 座阀                  # 产品线
productType: 电动二通阀            # 产品类型
mediaType: 冷热水                  # 适用介质
relatedEntities:                  # 相关实体（双向链接）
  - v5011b3w                      # 同系列三通阀
  - v5011s2w                      # 同系列不锈钢版本
  - ml74                          # 配套执行器
relatedTopics:                    # 相关主题
  - valve-selection               # 阀门选型主题
sources:                          # 来源素材
  - pdfs/霍尼韦尔暖通空调电动阀与执行器综合样册-2025.pdf
---
```

**内容结构**：
```markdown
# 产品名称

## 产品图片
![霍尼韦尔{系列名}产品外观图](/images/products/{slug}.webp)
*霍尼韦尔{系列名}电动座阀外观图*

## 产品概述
（产品简介、应用场景）

## 技术参数
（详细参数表格）

## 产品特性
（核心卖点）

## 配套产品
- [[ML74]] 系列执行器
- [[ML8824]] 系列执行器

## 相关主题
- [[阀门选型]]
```

**结构化数据（可选，用于富媒体摘要）**：
```markdown
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
```

### wiki/topics/ — 主题页

技术概念、应用场景等跨产品的通用知识。

**Frontmatter 规范**：
```yaml
---
# SEO 字段
title: 电动阀门选型指南
slug: valve-selection
date: 2026-04-12T00:00:00.000Z
updatedAt: 2026-04-12T00:00:00.000Z      # 新增：最后更新时间（重要：影响时效性排名）
author: 湖北科信达机电设备有限公司技术部
category: selection-guide
status: published
location: "湖北武汉"                      # 新增：服务地区（强化本地SEO）
seoTitle: 霍尼韦尔电动阀门选型指南_技术文章_湖北科信达
seoDescription: 湖北科信达为您带来霍尼韦尔电动阀门选型的专业技术指南...
keywords: '霍尼韦尔阀门,电动阀门选型...'
canonical: https://www.hubeikexinda.online/selection-guide/valve-selection  # 新增：规范URL，防止重复内容
relatedLinks: ["/products", "/cases"]  # 内部相关页面链接

# LLM Wiki 字段
type: topic                       # 类型：topic
tags: 
  - 选型指南
  - 电动阀门
  - 暖通工程
relatedEntities:                  # 相关的实体
  - v5011b2w
  - v5gv2w
  - ml74
relatedTopics:                    # 相关的主题
  - steam-valve-selection        # 蒸汽阀选型（相关主题）
sources:                          # 来源素材
  - pdfs/霍尼韦尔暖通空调电动阀与执行器综合样册-2025.pdf
---
```

### wiki/explorations/ — 查询分析归档

保存研究探索的结果，查询答案归档。

**Frontmatter 规范**：
```yaml
---
title: "V5011B2W 选型深度分析"
slug: v5011b2w-selection-analysis
type: exploration
date: 2026-04-14
query: "V5011B2W 和 V5GV2W 在大型商业综合体中如何选择？"
sources:
  - v5011b2w
  - v5gv2w
  - valve-selection
tags: [选型分析, 商业综合体, 座阀]
status: completed  # completed / draft / outdated
---
```

### wiki/decisions/ — 技术决策记录

记录重要决策及其理由。

**Frontmatter 规范**：
```yaml
---
title: "2026年产品线策略决策"
slug: product-line-strategy-2026
type: decision
date: 2026-04-14
decision_maker: 技术委员会
status: approved  # proposed / approved / rejected / superseded
supersedes: []    # 替代了哪些旧决策
---
```

### wiki/drafts/ — 草稿

临时草稿，用于人工审核。

### wiki/sources/ — 素材摘要页

raw/ 目录中素材的摘要和索引。

```markdown
---
title: "霍尼韦尔暖通空调电动阀与执行器综合样册-2025"
sourceType: pdf
sourcePath: ../raw/pdfs/霍尼韦尔暖通空调电动阀与执行器综合样册-2025.pdf
date: 2026-04-12
---

# 素材摘要

## 来源信息
- **文档名称**：霍尼韦尔暖通空调电动阀与执行器综合样册-2025
- **文档类型**：产品样册
- **发布日期**：2025年

## 主要内容
本文档涵盖霍尼韦尔全系列电动阀与执行器产品...

## 生成的实体页
- [[V5011B2W]]
- [[V5011S2W]]
- [[ML74]]
...
```

### wiki/index.md — 内容索引

知识库索引，供查询时快速定位。

### wiki/_schema.md — 架构规范

详细规则文件，指导 LLM 如何维护知识库。

### wiki/log.md — 操作日志

记录所有知识库操作，便于追溯。

## manifests/ 目录规范

### raw-sources.csv 格式

```csv
filename,type,date_added,date_modified,processed_date,status,version,check_sum,wiki_pages
pdfs/霍尼韦尔样册2025.pdf,pdf,2026-04-12,2026-04-12,2026-04-12,processed,1.0,abc123,"v5011b2w,v5011s2w,ml74"
```

**字段说明**：
| 字段 | 说明 | 示例 |
|------|------|------|
| `filename` | 文件名（相对于 raw/ 目录） | `pdfs/霍尼韦尔样册2025.pdf` |
| `type` | 素材类型 | `pdf` / `article` / `wechat` / `note` |
| `date_added` | 添加到 raw/ 的日期 | `2026-04-12` |
| `date_modified` | 文件最后修改日期 | `2026-04-12` |
| `processed_date` | 处理完成日期 | `2026-04-12` / `null` |
| `status` | 处理状态 | `pending` / `processing` / `processed` / `error` |
| `version` | 素材版本号 | `1.0` / `null` |
| `check_sum` | 文件校验和（MD5） | `abc123...` |
| `wiki_pages` | 生成的 wiki 页面（逗号分隔） | `v5011b2w,ml74` |

## AI 生成规范

### 当前推荐方式：使用 Trae AI

**为什么使用 Trae AI 而不是 Moonshot API？**
1. **免费**：Trae AI 提供免费的大模型调用，无需额外费用
2. **更灵活**：Trae AI 可以理解项目上下文，直接处理和生成文件
3. **更易用**：直接对话即可，无需配置 API Key 和编写脚本

### 推荐使用的大模型

处理内容较多的 PDF 时，推荐使用以下大模型（按优先级排序）：

| 模型 | 特点 | 上下文窗口（估计） | 推荐度 |
|------|------|------------------|---------|
| **GLM-5.1** | 智谱最新模型，能力最强 | 128K | ⭐⭐⭐⭐⭐ |
| **GLM-5 Beta** | 智谱 GLM-5 系列 | 128K | ⭐⭐⭐⭐ |
| **Kimi-K2.5** | Moonshot Kimi 系列 | 128K | ⭐⭐⭐⭐ |
| **GLM-5V-Turbo Beta** | 智谱多模态（支持图片） | 128K | ⭐⭐⭐⭐ |
| **Qwen3.5-Plus** | 通义千问最新 | 32K 或 128K | ⭐⭐⭐⭐ |

**推荐选择：GLM-5.1**，128K 上下文窗口，不容易遗漏产品信息。

### 后期如何切换回 Moonshot API

如果需要切换回 Moonshot API：
1. 确保 `.env` 中配置了 `MOONSHOT_API_KEY`
2. 直接运行脚本：`node scripts/ingest.js`
3. 脚本会自动调用 Moonshot API 处理 PDF

## 同步规范

`wiki/` 是知识源，`content/` 是网站展示层。

```
wiki/entities/*.md        →  content/products/*.md
wiki/topics/*.md          →  content/selection-guide/*.md
wiki/sources/*.md         →  不同步（内部参考）
wiki/index.md             →  不同步（内部管理）
wiki/log.md               →  不同步（内部管理）
wiki/explorations/*.md    →  不同步（内部管理）
wiki/decisions/*.md       →  不同步（内部管理）
wiki/drafts/*.md          →  不同步（草稿）
```

同步时保留所有字段，但剥离 `[[双向链接]]` 语法。

## 链接规范

- 页面间使用 `[[双向链接]]` 引用
- 引用 raw/ 素材使用 `[来源](../raw/pdfs/xxx.pdf)`
- 每个实体页必须链接到相关主题页
- 使用 `[[PageName]]` 格式时，PageName 应该是页面的 slug（不含 .md）

## Frontmatter 规范通用要求

### 通用字段要求
- 所有页面必须包含 `type` 字段：`entity` / `topic` / `exploration` / `decision` / `source`
- 所有页面必须包含 `sources` 字段，记录来源素材
- `relatedEntities` 和 `relatedTopics` 用于建立双向链接
- 保持 SEO 字段的完整性，用于网站展示

### SEO 字段（百度SEO强制要求）
- `updatedAt`：最后更新时间（重要：影响时效性排名）
- `location`：服务地区（强化本地SEO）
- `canonical`：规范URL，防止重复内容
- `relatedLinks`：内部相关页面链接
- `seoTitle`：60字符以内，核心关键词前置
- `seoDescription`：150-160字符，包含关键词
- `keywords`：3-5个核心关键词
