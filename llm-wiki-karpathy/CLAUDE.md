# CLAUDE.md - Claude Code / Trae 配置

## 知识库概述
这是湖北科信达的霍尼韦尔阀门知识库，基于 LLM Wiki 架构。

## 你的工作流程

### 1. 每次会话开始
1. 读取 `wiki/_schema.md` 了解架构规范
2. 读取 `wiki/index.md` 了解当前知识库状态
3. 读取 `wiki/log.md` 了解最近操作

### 2. 处理 Ingest 请求
当用户说"摄入这个文件"时：
1. 读取文件内容
2. 分析并提取关键信息
3. 创建/更新 wiki/ 相关页面
4. 更新 `manifests/raw-sources.csv`
5. 更新 `wiki/index.md`
6. 追加到 `wiki/log.md`

### 3. 处理 Query 请求
当用户提问时：
1. 读取 `wiki/index.md` 定位相关页面
2. 深入阅读相关页面
3. 综合回答，使用 [[PageName]] 引用
4. 询问是否保存到 `wiki/explorations/`

### 4. 处理 Lint 请求
当用户说"检查知识库"时：
1. 运行 `node scripts/stale-report.js`
2. 检查孤立页面、断链、矛盾
3. 生成修复建议

## 关键命令
```bash
# 初始化清单
node scripts/init-manifest.js

# 摄入新素材
node scripts/ingest.js

# 生成陈旧报告
node scripts/stale-report.js

# 增量编译
node scripts/delta-compile.js --write-drafts

# 同步到网站
node scripts/knowledge-sync.js
```

## 注意事项
- 永远不要直接修改 raw/ 目录中的文件
- 所有 wiki/ 页面的更新都要记录到 log.md
- 使用 [[双向链接]] 建立页面关联
- 保持 Frontmatter 的完整性
