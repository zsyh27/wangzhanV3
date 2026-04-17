# @wangzhan/cron-task-manager

定时任务管理器 - 支持Cron表达式调度和可视化管理

## 功能特性

- ✅ **Cron表达式调度** - 支持标准Cron表达式（分 时 日 月 周）
- ✅ **可视化管理** - 提供React管理界面
- ✅ **RESTful API** - 完整的CRUD API接口
- ✅ **多种存储** - 支持文件存储和内存存储
- ✅ **任务执行器** - 可扩展的任务执行机制
- ✅ **调度器脚本** - 支持后台运行和系统定时任务

## 项目结构

```
packages/cron-task-manager/
├── src/
│   ├── core/                    # 核心逻辑（框架无关）
│   │   ├── types.ts             # 类型定义
│   │   ├── TaskManager.ts       # 任务管理器
│   │   ├── CronScheduler.ts     # Cron调度器
│   │   └── index.ts
│   ├── storage/                 # 存储适配器
│   │   ├── FileStorage.ts       # 文件存储
│   │   ├── MemoryStorage.ts     # 内存存储
│   │   └── index.ts
│   ├── nextjs/                  # Next.js集成
│   │   ├── pages/
│   │   │   └── admin/
│   │   │       └── tasks/
│   │   │           └── page.tsx # 管理页面
│   │   ├── api/
│   │   │   └── tasks/
│   │   │       ├── route.ts     # API路由
│   │   │       └── execute/
│   │   │           └── route.ts
│   │   └── index.ts
│   ├── scripts/                 # 调度脚本
│   │   ├── task-scheduler.ts    # 后台调度器
│   │   └── check-scheduled-tasks.ts
│   └── index.ts                 # 主入口
├── package.json
├── tsconfig.json
└── README.md
```

## 安装

```bash
# 在workspace根目录安装
npm install

# 构建包
npm run build:packages
```

## 使用方法

### 1. 基础使用（框架无关）

```typescript
import { TaskManager, FileStorage, CronScheduler } from '@wangzhan/cron-task-manager';

// 初始化存储
const storage = new FileStorage({ path: './data/tasks' });

// 创建任务管理器
const taskManager = new TaskManager({ storage });

// 创建任务
const task = await taskManager.createTask({
  name: '每日数据备份',
  type: 'custom',
  schedule: '0 2 * * *',  // 每天2点执行
  status: 'active'
});

// 启动调度器
const scheduler = new CronScheduler(taskManager, {
  checkInterval: 60000,  // 每分钟检查一次
  autoStart: true
});
```

### 2. Next.js集成

#### API路由配置

创建 `app/api/tasks/route.ts`:

```typescript
export { 
  GET as tasksGET, 
  POST as tasksPOST, 
  PUT as tasksPUT, 
  DELETE as tasksDELETE 
} from '@wangzhan/cron-task-manager/nextjs/api/tasks/route';
```

创建 `app/api/tasks/execute/route.ts`:

```typescript
export { POST as executePOST } from '@wangzhan/cron-task-manager/nextjs/api/tasks/execute/route';
```

#### 管理页面

创建 `app/admin/tasks/page.tsx`:

```typescript
export { default } from '@wangzhan/cron-task-manager/nextjs/pages/admin/tasks/page';
```

### 3. 自定义任务执行器

```typescript
import { TaskExecutor, ScheduledTask, TaskExecutionResult } from '@wangzhan/cron-task-manager';

class MyTaskExecutor implements TaskExecutor {
  supportedTypes = ['custom'];

  async execute(task: ScheduledTask): Promise<TaskExecutionResult> {
    // 自定义执行逻辑
    console.log(`执行任务: ${task.name}`);
    
    return {
      success: true,
      message: '执行成功'
    };
  }
}

// 注册执行器
const executor = new MyTaskExecutor();
taskManager.registerExecutor('custom', executor);
```

## Cron表达式格式

格式: `分 时 日 月 周`

| 字段 | 范围 | 说明 |
|------|------|------|
| 分 | 0-59 | 分钟 |
| 时 | 0-23 | 小时 |
| 日 | 1-31 | 日期 |
| 月 | 1-12 | 月份 |
| 周 | 0-6 | 星期（0=周日）|

### 常用示例

| 表达式 | 说明 |
|--------|------|
| `30 8 * * *` | 每天8:30执行 |
| `0 12 * * 1-5` | 工作日12:00执行 |
| `0 0 1 * *` | 每月1日0:00执行 |
| `0 0 * * 0` | 每周日0:00执行 |
| `*/15 * * * *` | 每15分钟执行一次 |
| `0 */2 * * *` | 每2小时执行一次 |

## 后台运行

### 方式1：使用调度器脚本（推荐）

```bash
# 开发环境
npx ts-node packages/cron-task-manager/src/scripts/task-scheduler.ts

# 或使用pm2
pm2 start packages/cron-task-manager/dist/scripts/task-scheduler.js
```

### 方式2：使用系统定时任务

添加crontab:

```bash
# 每分钟执行一次检查
* * * * * cd /path/to/project && node packages/cron-task-manager/dist/scripts/check-scheduled-tasks.js
```

## API接口

### 获取任务列表
```http
GET /api/tasks
```

### 创建任务
```http
POST /api/tasks
Content-Type: application/json

{
  "name": "任务名称",
  "type": "content-generator",
  "schedule": "0 8 * * *",
  "status": "active"
}
```

### 更新任务
```http
PUT /api/tasks
Content-Type: application/json

{
  "id": "task-id",
  "name": "新名称",
  "schedule": "0 9 * * *"
}
```

### 删除任务
```http
DELETE /api/tasks?id=task-id
```

### 立即执行任务
```http
POST /api/tasks/execute
Content-Type: application/json

{
  "id": "task-id"
}
```

## 与原项目的关系

本项目是对原 `wangzhan` 项目中定时任务功能的提取和封装：

| 原文件 | 新位置 | 说明 |
|--------|--------|------|
| `lib/task-manager.ts` | `src/core/TaskManager.ts` | 核心逻辑重构 |
| `scripts/task-scheduler.js` | `src/scripts/task-scheduler.ts` | 调度器重构 |
| `app/admin/page.tsx` | `src/nextjs/pages/admin/tasks/page.tsx` | 管理界面 |
| `app/api/tasks/route.js` | `src/nextjs/api/tasks/route.ts` | API路由 |

原项目代码保持不变，新包提供：
- 更清晰的架构设计
- 完整的TypeScript类型支持
- 可扩展的执行器机制
- 更好的测试支持

## 开发

```bash
# 进入包目录
cd packages/cron-task-manager

# 安装依赖
npm install

# 开发模式（自动编译）
npm run dev

# 构建
npm run build

# 清理
npm run clean
```

## 许可证

MIT
