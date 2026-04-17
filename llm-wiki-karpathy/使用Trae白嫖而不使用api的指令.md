# 快速参考指南

### 方法一：直接从 QUICK\_REFERENCE.md 复制

打开 QUICK\_REFERENCE.md ，复制你需要的命令模板，直接发给 Trae AI。

### 方法二：简单说，让 Trae AI 自己看

你也可以简单说：

```
请按照 QUICK_REFERENCE.md 中的"处理新 PDF 并生成 wiki"模板处理这个 PDF。
```

Trae AI 会读取 QUICK\_REFERENCE.md ，然后按照模板执行。

<br />

## 常用命令模板

### 1. 处理新 PDF 并生成 wiki

```
请仔细阅读这个 PDF 的完整内容，确保不遗漏任何产品信息。
请按照以下步骤处理：

1. 读取 PDF 内容
2. **提取产品清单（关键步骤，防止遗漏）**
   - 先读取PDF目录或产品列表页
   - 列出所有产品型号（如：V5011B2W、ML74、VBA16P等）
   - 统计产品总数
   - **向我确认产品清单后再继续**
3. 分析并提取所有产品信息和技术主题
4. 在 llm-wiki-karpathy/wiki/entities/ 下生成产品页面
5. 在 llm-wiki-karpathy/wiki/topics/ 下生成技术主题页面
6. 使用 [[PageName]] 格式建立双向链接
7. 更新 llm-wiki-karpathy/manifests/raw-sources.csv
8. 更新 llm-wiki-karpathy/wiki/index.md
9. 追加到 llm-wiki-karpathy/wiki/log.md
```

**防遗漏检查清单（生成前必须完成）**
- [ ] 已读取PDF目录/产品列表
- [ ] 已列出所有产品型号
- [ ] 已统计产品总数
- [ ] 已向我确认产品清单

**重要：生成页面时请遵循以下规范（同时适用于产品页面和技术主题页面）**

**第一步：读取 SCHEMA.md**
在生成页面之前，请先读取 `llm-wiki-karpathy/SCHEMA.md` 文件，严格按照其中的规范生成页面。

**第二步：Frontmatter 必需字段（核心要求）**

**产品页面（wiki/entities/）必须包含：**
```yaml
---
# SEO 字段（百度SEO强制要求：title/description/keywords）
title: {产品系列名称}                    # 60字符以内，核心关键词前置
slug: {小写系列名}
date: {当前ISO日期}
updatedAt: {当前ISO日期}                # 新增：最后更新时间（重要：影响时效性排名
author: 湖北科信达机电设备有限公司技术部
category: {产品分类}
status: published
location: "湖北武汉"                    # 新增：服务地区（强化本地SEO）
seoTitle: 霍尼韦尔{系列名}_{分类}_产品参数_湖北科信达
seoDescription: 湖北科信达为您详细介绍霍尼韦尔{产品名}技术参数、特点及应用...    # 150-160字符
keywords: {霍尼韦尔,{系列名},{产品类型}}    # 3-5个核心关键词
canonical: https://www.hubeikexinda.online/products/{slug}  # 新增：规范URL，防止重复内容
relatedLinks: ["/selection-guide", "/contact"]  # 新增：内部相关页面链接

# LLM Wiki 字段（这些字段容易遗漏，务必包含）
model: {系列名}              # 必需：用于前端显示"型号"
brand: 霍尼韦尔
type: entity                 # 必需：固定值 entity
productLine: {产品线}        # 如：座阀/执行器
productType: {产品类型}      # 如：电动二通阀/直行程执行器
mediaType: {适用介质}        # 如：冷热水/蒸汽
relatedEntities:             # 双向链接：相关实体
  - {配套产品slug}
relatedTopics:               # 双向链接：相关主题
  - {主题slug}
sources:                     # 必需：来源素材
  - pdfs/{PDF文件名}
---
```

**技术主题页面（wiki/topics/）必须包含：**
```yaml
---
# SEO 字段（百度SEO强制要求：title/description/keywords）
title: {主题名称}                    # 60字符以内，核心关键词前置
slug: {小写主题名}
date: {当前ISO日期}
updatedAt: {当前ISO日期}                # 新增：最后更新时间（重要：影响时效性排名
author: 湖北科信达机电设备有限公司技术部
category: {分类}
status: published
location: "湖北武汉"                    # 新增：服务地区（强化本地SEO）
seoTitle: {主题SEO标题}
seoDescription: {主题SEO描述}        # 150-160字符
keywords: {关键词}                   # 3-5个核心关键词
canonical: https://www.hubeikexinda.online/selection-guide/{slug}  # 新增：规范URL，防止重复内容
relatedLinks: ["/products", "/cases"]  # 新增：内部相关页面链接

# LLM Wiki 字段
type: topic                  # 必需：固定值 topic
tags:                        # 标签
  - {标签1}
  - {标签2}
relatedEntities:             # 双向链接：相关实体
  - {产品slug}
relatedTopics:               # 双向链接：相关主题
  - {主题slug}
sources:                     # 必需：来源素材
  - pdfs/{PDF文件名}
---
```

**第三步：双向链接规范**
- 使用 `[[PageName]]` 格式建立链接
- PageName 使用页面的 slug（不含 .md）
- 产品页面必须链接到配套产品和相关技术主题
- 技术主题页面必须链接到相关产品

**第四步：产品页面内容章节（尽可能包含）**
1. **产品图片**（新增，重要：影响图片搜索）- 产品实拍图，带alt属性
   ```markdown
   ![霍尼韦尔{系列名}产品外观图](/images/products/{slug}.webp)
   *霍尼韦尔{系列名}电动座阀外观图*
   ```
2. **产品概述** - 产品简介、应用场景概述
3. **技术参数** - 详细的技术参数表格
4. **材质说明** / **材质** - 产品材质信息
5. **产品特性** - 核心卖点列表
6. **功能说明** - 功能详细说明
7. **订货信息** - 订货型号和参数
8. **尺寸和重量** - 尺寸重量表格
9. **配套产品** - 双向链接（如：`[[ML74]] 系列执行器`）
10. **应用场景** - 详细的应用场景说明
11. **选型要点** - 选型建议
12. **常见问题** - FAQ问答
13. **联系我们** - 固定格式：
    ```
    如需了解更多 {系列名} 系列产品信息，欢迎联系湖北科信达机电设备有限公司。

    联系电话：13907117179
    服务范围：湖北全省
    ```

**第五步：结构化数据（新增，重要：富媒体摘要）**
在页面底部添加产品结构化数据：
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

**第六步：技术主题页面内容**
- 主题概述：介绍主题的核心概念
- 详细内容：分章节详细说明
- 相关产品：双向链接到相关产品页面
- 应用建议：实际应用中的建议

***

### 2. 处理新 PDF 并同步到网站

```
请仔细阅读这个 PDF 的完整内容，确保不遗漏任何产品信息。
请按照以下步骤处理：

1. 读取 PDF 内容
2. **提取产品清单（关键步骤，防止遗漏）**
   - 先读取PDF目录或产品列表页
   - 列出所有产品型号（如：V5011B2W、ML74、VBA16P等）
   - 统计产品总数
   - **向我确认产品清单后再继续**
3. 分析并提取所有产品信息和技术主题
4. 在 llm-wiki-karpathy/wiki/entities/ 下生成产品页面
5. 在 llm-wiki-karpathy/wiki/topics/ 下生成技术主题页面
6. 使用 [[PageName]] 格式建立双向链接
7. 更新 llm-wiki-karpathy/manifests/raw-sources.csv
8. 更新 llm-wiki-karpathy/wiki/index.md
9. 追加到 llm-wiki-karpathy/wiki/log.md
10. 同步内容到 content/products/ 和 content/selection-guide/
```

**防遗漏检查清单（生成前必须完成）**
- [ ] 已读取PDF目录/产品列表
- [ ] 已列出所有产品型号
- [ ] 已统计产品总数
- [ ] 已向我确认产品清单

**重要：生成页面时请遵循以下规范（同时适用于产品页面和技术主题页面）**

**第一步：读取 SCHEMA.md**
在生成页面之前，请先读取 `llm-wiki-karpathy/SCHEMA.md` 文件，严格按照其中的规范生成页面。

**第二步：Frontmatter 必需字段（核心要求）**

**产品页面（wiki/entities/）必须包含：**
```yaml
---
# SEO 字段（百度SEO强制要求：title/description/keywords）
title: {产品系列名称}                    # 60字符以内，核心关键词前置
slug: {小写系列名}
date: {当前ISO日期}
updatedAt: {当前ISO日期}                # 新增：最后更新时间（重要：影响时效性排名
author: 湖北科信达机电设备有限公司技术部
category: {产品分类}
status: published
location: "湖北武汉"                    # 新增：服务地区（强化本地SEO）
seoTitle: 霍尼韦尔{系列名}_{分类}_产品参数_湖北科信达
seoDescription: 湖北科信达为您详细介绍霍尼韦尔{产品名}技术参数、特点及应用...    # 150-160字符
keywords: {霍尼韦尔,{系列名},{产品类型}}    # 3-5个核心关键词
canonical: https://www.hubeikexinda.online/products/{slug}  # 新增：规范URL，防止重复内容
relatedLinks: ["/selection-guide", "/contact"]  # 新增：内部相关页面链接

# LLM Wiki 字段（这些字段容易遗漏，务必包含）
model: {系列名}              # 必需：用于前端显示"型号"
brand: 霍尼韦尔
type: entity                 # 必需：固定值 entity
productLine: {产品线}        # 如：座阀/执行器
productType: {产品类型}      # 如：电动二通阀/直行程执行器
mediaType: {适用介质}        # 如：冷热水/蒸汽
relatedEntities:             # 双向链接：相关实体
  - {配套产品slug}
relatedTopics:               # 双向链接：相关主题
  - {主题slug}
sources:                     # 必需：来源素材
  - pdfs/{PDF文件名}
---
```

**技术主题页面（wiki/topics/）必须包含：**
```yaml
---
# SEO 字段（百度SEO强制要求：title/description/keywords）
title: {主题名称}                    # 60字符以内，核心关键词前置
slug: {小写主题名}
date: {当前ISO日期}
updatedAt: {当前ISO日期}                # 新增：最后更新时间（重要：影响时效性排名
author: 湖北科信达机电设备有限公司技术部
category: {分类}
status: published
location: "湖北武汉"                    # 新增：服务地区（强化本地SEO）
seoTitle: {主题SEO标题}
seoDescription: {主题SEO描述}        # 150-160字符
keywords: {关键词}                   # 3-5个核心关键词
canonical: https://www.hubeikexinda.online/selection-guide/{slug}  # 新增：规范URL，防止重复内容
relatedLinks: ["/products", "/cases"]  # 新增：内部相关页面链接

# LLM Wiki 字段
type: topic                  # 必需：固定值 topic
tags:                        # 标签
  - {标签1}
  - {标签2}
relatedEntities:             # 双向链接：相关实体
  - {产品slug}
relatedTopics:               # 双向链接：相关主题
  - {主题slug}
sources:                     # 必需：来源素材
  - pdfs/{PDF文件名}
---
```

**第三步：双向链接规范**
- 使用 `[[PageName]]` 格式建立链接
- PageName 使用页面的 slug（不含 .md）
- 产品页面必须链接到配套产品和相关技术主题
- 技术主题页面必须链接到相关产品

**第四步：产品页面内容章节（尽可能包含）**
1. **产品图片**（新增，重要：影响图片搜索）- 产品实拍图，带alt属性
   ```markdown
   ![霍尼韦尔{系列名}产品外观图](/images/products/{slug}.webp)
   *霍尼韦尔{系列名}电动座阀外观图*
   ```
2. **产品概述** - 产品简介、应用场景概述
3. **技术参数** - 详细的技术参数表格
4. **材质说明** / **材质** - 产品材质信息
5. **产品特性** - 核心卖点列表
6. **功能说明** - 功能详细说明
7. **订货信息** - 订货型号和参数
8. **尺寸和重量** - 尺寸重量表格
9. **配套产品** - 双向链接（如：`[[ML74]] 系列执行器`）
10. **应用场景** - 详细的应用场景说明
11. **选型要点** - 选型建议
12. **常见问题** - FAQ问答
13. **联系我们** - 固定格式：
    ```
    如需了解更多 {系列名} 系列产品信息，欢迎联系湖北科信达机电设备有限公司。

    联系电话：13907117179
    服务范围：湖北全省
    ```

**第五步：结构化数据（新增，重要：富媒体摘要）**
在页面底部添加产品结构化数据：
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

**第六步：技术主题页面内容**
- 主题概述：介绍主题的核心概念
- 详细内容：分章节详细说明
- 相关产品：双向链接到相关产品页面
- 应用建议：实际应用中的建议

***

### 3. 查询知识库

```
请查询知识库，告诉我关于 [产品名称] 的信息。
```

示例：

```
请查询知识库，告诉我关于 V5011B2W 阀门的信息，包括配套的执行器型号。
```

***

### 4. 检查知识库

```
请检查知识库，运行 lint 检查，看看有没有孤立页面、断链或其他问题。
```

***

### 5. 同步到网站

```
请把 llm-wiki-karpathy/wiki/entities/ 下的页面同步到 content/products/，把 llm-wiki-karpathy/wiki/topics/ 下的页面同步到 content/selection-guide/。
```

***

## 工作流程

### 完整流程

1. **添加新 PDF 素材** → 放入 `llm-wiki-karpathy/raw/pdfs/` 目录
2. **让 Trae AI 生成 wiki** → 使用命令模板 1 或 2
3. **审核 wiki** → 用 Obsidian 打开 `llm-wiki-karpathy/` 查看
4. **（可选）同步到网站** → 使用命令模板 5

***

## 目录结构

```
llm-wiki-karpathy/
├── raw/                          # 原始素材（只读）
│   └── pdfs/                     # PDF文档
├── wiki/                         # 知识库页面
│   ├── entities/                 # 产品实体页面
│   ├── topics/                   # 技术主题页面
│   ├── sources/                  # 素材摘要页
│   ├── explorations/             # 查询分析归档
│   ├── decisions/                # 技术决策记录
│   ├── drafts/                   # 草稿
│   ├── products/                 # 产品文件夹
│   ├── _schema.md                # 架构规范
│   ├── index.md                  # 知识库索引
│   ├── rules.md                  # 经验规则库
│   └── log.md                    # 操作日志
├── manifests/                    # 素材清单
│   └── raw-sources.csv          # 原始素材清单
├── scripts/                      # 处理脚本
├── .cursorrules                  # Cursor IDE 配置
├── CLAUDE.md                    # Claude Code 配置
└── QUICK_REFERENCE.md           # 本文档

content/
├── products/                     # 网站产品页面（从 wiki/entities/ 同步）
└── selection-guide/              # 网站技术文章（从 wiki/topics/ 同步）
```

***

## 注意事项

1. 永远不要直接修改 `raw/` 目录中的文件
2. 所有 `wiki/` 页面的更新都要记录到 `log.md`
3. 使用 `[[双向链接]]` 建立页面关联
4. 保持 Frontmatter 的完整性

