# LLM Wiki Karpathy 改造项目 - 详细实施计划

## 项目概述

将现有的 llm-wiki-karpathy 知识库改造为接近 Karpathy 描述的完整架构，借鉴 Ss1024sS/LLM-wiki 和 xiaobai-agent/llm-wiki 的最佳实践。

## 实施阶段

### 阶段 0：准备工作（1-2 天）

#### 0.1 环境准备
- [ ] 确保 Node.js 18+ 环境
- [ ] 安装必要的 npm 包：`csv-parser`, `csv-writer`, `md5` 等
- [ ] 配置 Moonshot API Key（用于 ingest 功能）
- [ ] 安装 Obsidian（用于可视化编辑）

#### 0.2 备份现有内容
```bash
# 备份现有 wiki 内容
cp -r wiki wiki.backup-$(date +%Y%m%d)
cp -r raw raw.backup-$(date +%Y%m%d)
```

#### 0.3 创建基础目录结构
```bash
mkdir -p manifests
mkdir -p wiki/explorations
mkdir -p wiki/decisions
mkdir -p wiki/drafts  # 用于 delta-compile 的草稿
```

---

### 阶段 1：P0 核心功能（3-5 天）

#### 1.1 Manifests 素材清单系统

**目标**：实现素材的追踪、去重和状态管理

**任务清单**：
- [ ] 1.1.1 创建 `manifests/raw-sources.csv` 模板
- [ ] 1.1.2 实现 `lib/manifest-manager.js` 核心模块
  - `readManifest()` - 读取 CSV
  - `writeManifest()` - 写入 CSV
  - `findSource()` - 查找素材
  - `addSource()` - 添加新素材
  - `updateSource()` - 更新素材状态
  - `calculateMD5()` - 计算文件校验和
- [ ] 1.1.3 实现 `scripts/init-manifest.js` 初始化脚本
  - 扫描现有 raw/ 目录
  - 生成初始清单
- [ ] 1.1.4 编写单元测试

**文件结构**：
```
lib/
└── manifest-manager.js       # 素材清单管理模块

manifests/
├── raw-sources.csv           # 素材清单（核心）
└── README.md                 # 使用说明

scripts/
└── init-manifest.js          # 初始化清单脚本
```

**验收标准**：
```bash
# 可以成功初始化清单
node scripts/init-manifest.js
# 输出：已扫描 5 个素材，已添加到 manifests/raw-sources.csv

# 可以读取和更新清单
node -e "const mm = require('./lib/manifest-manager'); console.log(mm.readManifest());"
```

#### 1.2 增强 Ingest 功能

**目标**：实现智能摄入，自动更新 manifests

**任务清单**：
- [ ] 1.2.1 分析现有 `scripts/parse-pdf.js` 和 `scripts/ai-knowledge-generate.js`
- [ ] 1.2.2 设计新的 `scripts/ingest.js` 架构
- [ ] 1.2.3 实现核心功能：
  - 扫描 raw/ 目录
  - 对比 manifests，发现新素材
  - 调用 LLM API 生成内容
  - 写入 wiki/ 目录
  - 更新 manifests
  - 记录 log.md
- [ ] 1.2.4 支持命令行参数：
  - `--source <path>` - 指定单个素材
  - `--dry-run` - 预览模式
  - `--force` - 强制重新处理
- [ ] 1.2.5 错误处理和重试机制
- [ ] 1.2.6 编写单元测试

**关键代码结构**：
```javascript
// scripts/ingest.js

async function main(options = {}) {
  // 1. 扫描并更新 manifests
  await scanAndUpdateManifest();
  
  // 2. 获取待处理素材
  const pendingSources = getPendingSources(options);
  
  // 3. 处理每个素材
  for (const source of pendingSources) {
    await processSource(source, options);
  }
  
  // 4. 生成报告
  generateReport();
}

async function processSource(source, options) {
  try {
    // 更新状态为 processing
    updateManifestStatus(source, 'processing');
    
    // 读取素材内容
    const content = await readSource(source);
    
    // 调用 LLM
    const result = await callLLM(generatePrompt(content));
    
    // 写入 wiki
    const wikiPages = await writeWikiPages(result);
    
    // 更新 manifests
    updateManifestStatus(source, 'processed', wikiPages);
    
    // 记录日志
    appendLog('ingest', source, wikiPages);
    
  } catch (error) {
    updateManifestStatus(source, 'error');
    console.error(error);
  }
}
```

**验收标准**：
```bash
# 可以摄入单个 PDF
node scripts/ingest.js --source raw/pdfs/霍尼韦尔样册2025.pdf

# 可以批量摄入所有 pending 素材
node scripts/ingest.js

# 可以预览模式
node scripts/ingest.js --dry-run
```

#### 1.3 基础目录迁移

**目标**：将现有内容迁移到新结构

**任务清单**：
- [ ] 1.3.1 迁移 `wiki/products/` → `wiki/entities/`
  - 保持文件内容不变
  - 更新 frontmatter（添加 type: entity）
- [ ] 1.3.2 迁移 `wiki/selection-guide/` → `wiki/topics/`
  - 保持文件内容不变
  - 更新 frontmatter（添加 type: topic）
- [ ] 1.3.3 创建 `wiki/sources/` 目录
  - 为现有 PDF 创建摘要页
- [ ] 1.3.4 创建 `wiki/index.md` 初始版本
- [ ] 1.3.5 创建 `wiki/log.md` 初始版本

**迁移脚本**：
```bash
node scripts/migrate-structure.js
```

**验收标准**：
```bash
# 目录结构正确
ls wiki/entities/ | head
ls wiki/topics/ | head
ls wiki/sources/ | head

# index.md 存在
cat wiki/index.md | head -20
```

---

### 阶段 2：P1 增强功能（5-7 天）

#### 2.1 Stale Report 陈旧内容检测

**目标**：自动检测需要更新的 wiki 页面

**任务清单**：
- [ ] 2.1.1 实现 `lib/stale-detector.js` 核心模块
  - `findStalePages()` - 查找陈旧页面
  - `findOrphanedPages()` - 查找孤立页面
  - `findBrokenLinks()` - 查找断链
  - `calculateImpact()` - 计算影响范围
- [ ] 2.1.2 实现 `scripts/stale-report.js`
  - 生成 JSON 格式报告
  - 支持 `--format json|markdown` 输出格式
  - 支持 `--output <file>` 指定输出文件
- [ ] 2.1.3 实现报告展示功能
  - 控制台彩色输出
  - 按优先级排序
  - 显示影响范围

**报告格式示例**：
```json
{
  "generated_at": "2026-04-14T10:30:00.000Z",
  "summary": {
    "total_wiki_pages": 45,
    "stale_pages": 3,
    "orphaned_pages": 1,
    "broken_links": 2
  },
  "stale_pages": [...],
  "recommendations": [...]
}
```

**验收标准**：
```bash
# 生成陈旧报告
node scripts/stale-report.js

# 输出 Markdown 格式
node scripts/stale-report.js --format markdown --output stale-report.md
```

#### 2.2 Delta Compile 增量编译

**目标**：支持草稿模式和增量更新

**任务清单**：
- [ ] 2.2.1 实现 `scripts/delta-compile.js`
  - 读取 stale report
  - 支持 `--write-drafts` 生成草稿
  - 支持 `--pages <list>` 指定页面
  - 支持 `--force` 强制更新
- [ ] 2.2.2 实现草稿生成功能
  - 生成 `wiki/drafts/<page>.draft.md`
  - 保留原文件不变
  - 显示 diff
- [ ] 2.2.3 实现草稿合并功能
  - 审核通过后合并到正式页面
  - 备份原页面
  - 更新 manifests

**验收标准**：
```bash
# 生成草稿
node scripts/delta-compile.js --write-drafts

# 更新特定页面
node scripts/delta-compile.js --pages v5011b2w,ml74

# 强制更新所有陈旧页面
node scripts/delta-compile.js --force
```

#### 2.3 Explorations & Decisions 目录

**目标**：创建新的知识类型目录

**任务清单**：
- [ ] 2.3.1 创建 `wiki/explorations/` 目录结构
- [ ] 2.3.2 创建 `wiki/decisions/` 目录结构
- [ ] 2.3.3 创建 `wiki/rules.md` 初始版本
- [ ] 2.3.4 设计模板文件：
  - `templates/exploration.md`
  - `templates/decision.md`
  - `templates/rule.md`
- [ ] 2.3.5 实现 `scripts/create-exploration.js`
- [ ] 2.3.6 实现 `scripts/create-decision.js`

**模板示例**：
```markdown
# templates/exploration.md
---
title: "{{title}}"
slug: {{slug}}
type: exploration
date: {{date}}
query: "{{query}}"
sources: []
tags: []
status: draft
---

# {{title}}

## 原始问题
{{query}}

## 分析结论

## 关键发现

## 建议方案

## 相关实体

## 后续行动
```

**验收标准**：
```bash
# 创建新的 exploration
node scripts/create-exploration.js "V5011B2W 选型分析"

# 目录结构正确
ls wiki/explorations/
ls wiki/decisions/
cat wiki/rules.md
```

#### 2.4 Query 功能增强

**目标**：实现知识查询和归档

**任务清单**：
- [ ] 2.4.1 实现 `scripts/query.js`
  - 读取 index.md 定位相关页面
  - 综合回答
  - 支持 `--save` 保存到 explorations/
- [ ] 2.4.2 集成 LLM API
- [ ] 2.4.3 实现引用标注（[[PageName]]）

**验收标准**：
```bash
# 查询知识
node scripts/query.js "V5011B2W 和 V5GV2W 有什么区别？"

# 查询并保存
node scripts/query.js "商业综合体如何选型？" --save
```

---

### 阶段 3：P2 优化功能（3-5 天）

#### 3.1 多平台 AI 配置

**目标**：支持 Claude Code, Cursor 等平台

**任务清单**：
- [ ] 3.1.1 创建 `CLAUDE.md`
  - 工作流程说明
  - 常用命令
  - 注意事项
- [ ] 3.1.2 创建 `.cursorrules`
  - 角色定义
  - 代码规范
  - 工作流程
- [ ] 3.1.3 创建 `.windsurfrules`（可选）
- [ ] 3.1.4 测试各平台兼容性

**验收标准**：
```bash
# 配置文件存在
ls CLAUDE.md
ls .cursorrules
```

#### 3.2 Lint 功能完善

**目标**：全面的知识库健康检查

**任务清单**：
- [ ] 3.2.1 实现 `scripts/lint.js`
  - 检查 frontmatter 完整性
  - 检查双向链接有效性
  - 检查数据一致性
  - 生成报告
- [ ] 3.2.2 支持 `--fix` 自动修复
- [ ] 3.2.3 集成到 CI/CD

**验收标准**：
```bash
# 运行检查
node scripts/lint.js

# 自动修复
node scripts/lint.js --fix
```

#### 3.3 Index 自动更新

**目标**：自动维护 index.md

**任务清单**：
- [ ] 3.3.1 实现 `scripts/update-index.js`
  - 扫描所有 wiki 页面
  - 提取关键信息
  - 生成索引
- [ ] 3.3.2 集成到 ingest.js
- [ ] 3.3.3 支持按类型筛选

**验收标准**：
```bash
# 手动更新索引
node scripts/update-index.js

# index.md 内容正确
cat wiki/index.md
```

---

### 阶段 4：P3 高级功能（可选，5-7 天）

#### 4.1 Obsidian 插件配置

**目标**：优化 Obsidian 使用体验

**任务清单**：
- [ ] 4.1.1 配置 Dataview 插件查询
- [ ] 4.1.2 配置 Templater 模板
- [ ] 4.1.3 配置 Graph Analysis 图谱分析
- [ ] 4.1.4 创建 `.obsidian/` 配置目录

#### 4.2 API 接口开发

**目标**：提供 HTTP API 供外部调用

**任务清单**：
- [ ] 4.2.1 设计 API 规范
- [ ] 4.2.2 实现 `/api/query` 接口
- [ ] 4.2.3 实现 `/api/ingest` 接口
- [ ] 4.2.4 实现 `/api/status` 接口
- [ ] 4.2.5 添加身份验证

#### 4.3 自动化部署

**目标**：Git 推送自动部署

**任务清单**：
- [ ] 4.3.1 配置 GitHub Actions
- [ ] 4.3.2 配置 Webhook
- [ ] 4.3.3 编写部署脚本
- [ ] 4.3.4 测试自动部署流程

---

## 实施时间表

| 阶段 | 任务 | 预计时间 | 依赖 |
|------|------|---------|------|
| 阶段 0 | 准备工作 | 1-2 天 | 无 |
| 阶段 1 | P0 核心功能 | 3-5 天 | 阶段 0 |
| 阶段 2 | P1 增强功能 | 5-7 天 | 阶段 1 |
| 阶段 3 | P2 优化功能 | 3-5 天 | 阶段 2 |
| 阶段 4 | P3 高级功能 | 5-7 天 | 阶段 3 |

**总计**：约 17-26 天（不含 P3）

---

## 风险与应对

| 风险 | 可能性 | 影响 | 应对措施 |
|------|--------|------|---------|
| LLM API 调用失败 | 中 | 高 | 实现重试机制，本地缓存 |
| 现有内容格式不兼容 | 低 | 中 | 提前备份，编写迁移脚本 |
| 性能问题（大量文件） | 中 | 中 | 增量处理，异步操作 |
| 团队协作冲突 | 低 | 中 | 使用 Git，明确分工 |

---

## 成功标准

### 功能标准
- [ ] manifests/raw-sources.csv 可以正常追踪素材状态
- [ ] ingest.js 可以智能摄入新素材
- [ ] stale-report.js 可以检测陈旧内容
- [ ] delta-compile.js 支持草稿模式
- [ ] explorations/ 和 decisions/ 目录可以正常使用
- [ ] CLAUDE.md 和 .cursorrules 配置有效

### 性能标准
- [ ] 摄入单个素材 < 30 秒（含 LLM 调用）
- [ ] 生成 stale report < 5 秒（100 个页面）
- [ ] 增量编译 < 10 秒/页面

### 质量标准
- [ ] 单元测试覆盖率 > 70%
- [ ] 所有脚本有完整错误处理
- [ ] 文档完整，有使用示例

---

## 下一步行动

1. **立即开始**：阶段 0 准备工作
2. **本周完成**：阶段 1 P0 核心功能
3. **下周开始**：阶段 2 P1 增强功能

是否开始实施？