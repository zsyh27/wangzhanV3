# LLM Wiki Karpathy - 霍尼韦尔阀门知识库

基于 Andrej Karpathy 提出的 LLM Wiki 架构，为湖北科信达（霍尼韦尔阀门湖北授权代理商）构建的专业暖通阀门知识库。

## 核心理念

> "Obsidian 是 IDE，LLM 是程序员，wiki 是代码库。你几乎不直接编辑 wiki，那是 LLM 的领地。" —— Andrej Karpathy

本知识库遵循三层架构：
- **raw/** — 原始素材（只读，不可修改）
- **wiki/** — AI 编译的知识文章（LLM 拥有，人类可读可审）
- **Schema** — 规则文件（指导 LLM 如何工作）

## ⚠️ 当前使用方式：Trae AI vs Moonshot API

### 推荐使用方式：直接使用 Trae AI

**为什么使用 Trae AI 而不是 Moonshot API？**

1. **免费**：Trae AI 提供免费的大模型调用，无需额外费用
2. **更灵活**：Trae AI 可以理解项目上下文，直接处理和生成文件
3. **更易用**：直接对话即可，无需配置 API Key 和编写脚本

### 后期如何切换回 Moonshot API

如果需要切换回 Moonshot API：

1. 确保 `.env` 中配置了 `MOONSHOT_API_KEY`
2. 直接运行脚本：`node scripts/ingest.js`
3. 脚本会自动调用 Moonshot API 处理 PDF

## 推荐使用的大模型

处理内容较多的 PDF 时，推荐使用以下大模型（按优先级排序）：

| 模型 | 特点 | 上下文窗口（估计） | 推荐度 |
|------|------|------------------|---------|
| **GLM-5.1** | 智谱最新模型，能力最强 | 128K | ⭐⭐⭐⭐⭐ |
| **GLM-5 Beta** | 智谱 GLM-5 系列 | 128K | ⭐⭐⭐⭐ |
| **Kimi-K2.5** | Moonshot Kimi 系列 | 128K | ⭐⭐⭐⭐ |
| **GLM-5V-Turbo Beta** | 智谱多模态（支持图片） | 128K | ⭐⭐⭐⭐ |
| **Qwen3.5-Plus** | 通义千问最新 | 32K 或 128K | ⭐⭐⭐⭐ |

**推荐选择：GLM-5.1**，128K 上下文窗口，不容易遗漏产品信息。

## 目录结构

```
llm-wiki-karpathy/
├── raw/                           # 原始素材（不可变，只读）
│   ├── pdfs/                      # PDF 文档
│   │   └── 霍尼韦尔暖通空调电动阀与执行器综合样册-2025.pdf
│   ├── articles/                  # 网页文章（Obsidian Web Clipper 剪藏）
│   ├── wechat/                    # 微信公众号文章
│   ├── notes/                     # 手动笔记
│   └── assets/                    # 图片等附件
│
├── wiki/                          # AI 编译的知识库（LLM 拥有，人类可读）
│   ├── entities/                  # 实体页（产品型号、执行器型号）
│   │   ├── v5011b2w.md            # 产品实体
│   │   ├── ml74.md                # 执行器实体
│   │   └── ...
│   ├── topics/                    # 主题页（技术概念、应用场景）
│   │   ├── valve-selection.md     # 阀门选型主题
│   │   ├── steam-control.md       # 蒸汽控制主题
│   │   └── ...
│   ├── explorations/              # 查询分析归档
│   ├── decisions/                 # 技术决策记录
│   ├── drafts/                    # 草稿
│   ├── sources/                   # 素材摘要页（raw/ 的摘要）
│   │   ├── honeywell-catalog-2025.md
│   │   └── ...
│   ├── index.md                   # 内容索引（自动维护）
│   ├── _schema.md                 # 架构规范
│   └── log.md                     # 操作日志（自动维护）
│
├── manifests/                     # 素材清单
│   └── raw-sources.csv          # 原始素材清单
│
├── scripts/                       # 知识处理脚本
│   ├── ingest.js                  # 智能摄入脚本（⚠️ 当前推荐使用 Trae AI，而非此脚本）
│   ├── query.js                   # 知识查询脚本
│   ├── lint.js                    # 知识健康检查脚本
│   ├── update-index.js            # 索引更新脚本
│   ├── knowledge-sync.js          # 同步到 content/ 目录
│   ├── parse-pdf.js               # PDF 解析（现有）
│   ├── create-exploration.js      # 创建 exploration 页面
│   ├── create-decision.js         # 创建 decision 页面
│   ├── stale-report.js            # 陈旧内容检测
│   ├── delta-compile.js           # 增量编译
│   └── ...
│
├── .cursorrules                  # Cursor IDE / Trae 配置
├── CLAUDE.md                    # Claude Code / Trae 配置
├── QUICK_REFERENCE.md           # 快速参考指南（含常用命令模板）
└── README.md                      # 本文档

content/
├── products/                     # 网站产品页面（从 wiki/entities/ 同步）
└── selection-guide/              # 网站技术文章（从 wiki/topics/ 同步）
```

## 三层架构详解

### 第一层：raw/ — 原始素材

存放所有原始资料，按来源分类，**不可修改**。

| 目录 | 用途 | 示例 |
|------|------|------|
| `pdfs/` | PDF 产品手册、技术规格 | 霍尼韦尔产品样册 |
| `articles/` | 网页文章（Obsidian Web Clipper 剪藏） | 行业技术文章 |
| `wechat/` | 微信公众号文章 | 霍尼韦尔官方推文 |
| `notes/` | 手动笔记 | 会议纪要、技术笔记 |
| `assets/` | 图片、图表等附件 | 产品图片、安装图 |

**命名规范**：`{来源}-{文档名称}-{版本}.{扩展名}`

### 第二层：wiki/ — AI 编译的知识库

LLM 生成和维护的 Markdown 文件集合，**人类可读、可审、可编辑**。

#### 2.1 entities/ — 实体页

产品型号、执行器型号等具体实体的详细页面。

**Frontmatter 规范**：
```yaml
---
# SEO 字段（保留，用于网站展示）
title: 霍尼韦尔 V5011B2W 系列螺纹型电动座阀
slug: v5011b2w
date: 2026-04-12T00:00:00.000Z
author: 湖北科信达机电设备有限公司技术部
category: 电动座阀
status: published
seoTitle: 霍尼韦尔V5011B2W_螺纹型电动座阀_产品参数_湖北科信达
seoDescription: 湖北科信达为您详细介绍霍尼韦尔V5011B2W系列...
keywords: '霍尼韦尔阀门,V5011B2W,螺纹型电动座阀...'
relatedLinks: ["/selection-guide", "/contact"]

# LLM Wiki 字段（新增，用于知识管理）
model: V5011B2W                    # 产品型号
brand: 霍尼韦尔                    # 品牌
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

#### 2.2 topics/ — 主题页

技术概念、应用场景等跨产品的通用知识。

**Frontmatter 规范**：
```yaml
---
# SEO 字段
title: 电动阀门选型指南
slug: valve-selection
date: 2026-04-12T00:00:00.000Z
author: 湖北科信达机电设备有限公司技术部
category: selection-guide
status: published
seoTitle: 霍尼韦尔电动阀门选型指南_技术文章_湖北科信达
seoDescription: 湖北科信达为您带来霍尼韦尔电动阀门选型的专业技术指南...
keywords: '霍尼韦尔阀门,电动阀门选型...'
relatedLinks: ["/products", "/cases"]

# LLM Wiki 字段
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

#### 2.3 explorations/ — 查询分析归档

保存研究探索的结果，查询答案归档。

#### 2.4 decisions/ — 技术决策记录

记录重要决策及其理由。

#### 2.5 sources/ — 素材摘要页

raw/ 目录中素材的摘要和索引。

#### 2.6 index.md — 内容索引

知识库索引，供查询时快速定位。

#### 2.7 log.md — 操作日志

记录所有知识库操作，便于追溯。

### 第三层：Schema — 规则文件

#### _schema.md — 架构规范

详细规则文件，指导 LLM 如何维护知识库。

## 核心操作流程（推荐使用 Trae AI）

### 1. 添加新 PDF 并生成 wiki

**使用 QUICK_REFERENCE.md 中的命令模板**：

```
请仔细阅读这个 PDF 的完整内容，确保不遗漏任何产品信息。
请按照以下步骤处理：

1. 读取 PDF 内容
2. 分析并提取所有产品信息和技术主题，确保不遗漏任何产品
3. 在 llm-wiki-karpathy/wiki/entities/ 下生成产品页面
4. 在 llm-wiki-karpathy/wiki/topics/ 下生成技术主题页面
5. 使用 [[PageName]] 格式建立双向链接
6. 更新 llm-wiki-karpathy/manifests/raw-sources.csv
7. 更新 llm-wiki-karpathy/wiki/index.md
8. 追加到 llm-wiki-karpathy/wiki/log.md
```

### 2. 添加新 PDF 并同步到网站

```
请仔细阅读这个 PDF 的完整内容，确保不遗漏任何产品信息。
请按照以下步骤处理：

1. 读取 PDF 内容
2. 分析并提取所有产品信息和技术主题，确保不遗漏任何产品
3. 在 llm-wiki-karpathy/wiki/entities/ 下生成产品页面
4. 在 llm-wiki-karpathy/wiki/topics/ 下生成技术主题页面
5. 使用 [[PageName]] 格式建立双向链接
6. 更新 llm-wiki-karpathy/manifests/raw-sources.csv
7. 更新 llm-wiki-karpathy/wiki/index.md
8. 追加到 llm-wiki-karpathy/wiki/log.md
9. 同步内容到 content/products/ 和 content/selection-guide/
```

### 3. 查询知识库

```
请查询知识库，告诉我关于 [产品名称] 的信息。
```

### 4. 检查知识库

```
请检查知识库，运行 lint 检查，看看有没有孤立页面、断链或其他问题。
```

### 5. 同步到网站

```
请把 llm-wiki-karpathy/wiki/entities/ 下的页面同步到 content/products/，把 llm-wiki-karpathy/wiki/topics/ 下的页面同步到 content/selection-guide/。
```

## 完整工作流程

1. **添加新 PDF 素材** → 放入 `llm-wiki-karpathy/raw/` 目录
2. **让 Trae AI 生成 wiki** → 使用 QUICK_REFERENCE.md 中的命令模板
3. **审核 wiki** → 用 Obsidian 打开 `llm-wiki-karpathy/` 查看
4. **（可选）同步到网站** → 使用同步命令

## 与网站的集成

### 同步规则

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

## 本地开发工作流

### 1. 初始化（首次）

```bash
# 1. 安装 Obsidian
# 下载地址：https://obsidian.md/

# 2. 打开 Vault
# File → Open Vault → 选择 llm-wiki-karpathy/ 目录
```

### 2. 日常使用

```bash
# 1. 添加新的原始素材
# 将 PDF/文章放入 llm-wiki-karpathy/raw/ 对应目录

# 2. 使用 Trae AI 生成 wiki
# 复制 QUICK_REFERENCE.md 中的命令模板，发给 Trae AI

# 3. 在 Obsidian 中查看
# - 查看 Graph View 关系图谱
# - 检查新生成的页面和链接关系
# - 人工审核和微调

# 4. （可选）同步到网站
# 使用同步命令
```

## 参考资源

- [Karpathy 原帖：LLM Knowledge Bases](https://x.com/karpathy/status/1907531107851558934)
- [Karpathy Gist 文档](https://gist.github.com/karpathy/5e0bd0b9bb699897012a4e2f1325a2a1)
- [Obsidian 官网](https://obsidian.md/)

## 许可证

MIT License - 湖北科信达机电设备有限公司
