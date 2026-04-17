# Manifests 目录 - 素材清单管理

本目录用于管理知识库的原始素材清单，追踪素材状态、去重和版本控制。

## 文件说明

### raw-sources.csv
素材清单的核心文件，包含所有 raw/ 目录中的素材信息。

**CSV 格式**：
```csv
filename,type,date_added,date_modified,processed_date,status,version,check_sum,wiki_pages
pdfs/霍尼韦尔样册2025.pdf,pdf,2026-04-12,2026-04-12,2026-04-12,processed,1.0,abc123,"v5011b2w,v5011s2w,ml74"
articles/某技术文章.md,article,2026-04-13,2026-04-13,null,pending,null,def456,
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

### processing-queue.json
处理队列文件，用于异步处理素材。

### version-history.json
版本历史文件，记录所有素材的版本变更。

## 相关脚本

- `scripts/init-manifest.js` - 初始化清单
- `scripts/ingest.js` - 摄入新素材
- `lib/manifest-manager.js` - 清单管理模块

## 注意事项

- 不要手动编辑 `raw-sources.csv`，请使用脚本
- 所有日期格式为 YYYY-MM-DD
- `check_sum` 使用 MD5 算法
