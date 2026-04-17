/**
 * 定时任务管理器 - 类型定义
 */

/** 任务状态 */
export type TaskStatus = 'active' | 'inactive';

/** 任务类型 */
export type TaskType = 'product-sync' | 'selection-guide-sync' | 'news-sync' | 'news-generator' | 'custom';

/** 执行状态 */
export type ExecutionStatus = 'success' | 'failed' | 'pending' | 'running';

/** 微信同步状态 */
export type WechatSyncStatus = 'success' | 'failed' | 'pending' | 'not_configured';

/** 定时任务数据结构 */
export interface ScheduledTask {
  /** 任务唯一标识 */
  id: string;
  /** 任务名称 */
  name: string;
  /** 任务类型 */
  type: TaskType;
  /** Cron表达式 (分 时 日 月 周) */
  schedule: string;
  /** 任务状态 */
  status: TaskStatus;
  /** 最后执行时间 */
  lastRun?: string;
  /** 下次执行时间 */
  nextRun?: string;
  /** 最后执行状态 */
  lastRunStatus?: ExecutionStatus;
  /** 微信同步状态 */
  wechatSyncStatus?: WechatSyncStatus;
  /** 微信媒体ID */
  wechatMediaId?: string;
  /** 任务类型细分 */
  taskType?: string;
  /** 最后生成内容的slug */
  lastGeneratedSlug?: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 扩展元数据 */
  metadata?: Record<string, any>;
}

/** 创建任务DTO */
export interface CreateTaskDTO {
  name: string;
  type: TaskType;
  schedule: string;
  status?: TaskStatus;
  taskType?: string;
  metadata?: Record<string, any>;
}

/** 更新任务DTO */
export interface UpdateTaskDTO {
  name?: string;
  schedule?: string;
  status?: TaskStatus;
  taskType?: string;
  metadata?: Record<string, any>;
}

/** 任务执行结果 */
export interface TaskExecutionResult {
  /** 是否成功 */
  success: boolean;
  /** 执行消息 */
  message?: string;
  /** 微信同步状态 */
  wechatSyncStatus?: WechatSyncStatus;
  /** 微信媒体ID */
  wechatMediaId?: string;
  /** 生成的内容slug */
  slug?: string;
  /** 扩展数据 */
  metadata?: Record<string, any>;
  /** 错误信息 */
  error?: string;
}

/** 存储适配器接口 */
export interface StorageAdapter {
  /** 获取所有任务 */
  getAll(): Promise<ScheduledTask[]>;
  /** 根据ID获取任务 */
  getById(id: string): Promise<ScheduledTask | null>;
  /** 创建任务 */
  create(task: Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScheduledTask>;
  /** 更新任务 */
  update(id: string, updates: Partial<ScheduledTask>): Promise<ScheduledTask | null>;
  /** 删除任务 */
  delete(id: string): Promise<boolean>;
}

/** 任务执行器接口 */
export interface TaskExecutor {
  /** 执行任务 */
  execute(task: ScheduledTask): Promise<TaskExecutionResult>;
  /** 支持的task类型 */
  supportedTypes: TaskType[];
}

/** 调度器选项 */
export interface SchedulerOptions {
  /** 检查间隔（毫秒），默认60000（1分钟） */
  checkInterval?: number;
  /** 是否自动启动 */
  autoStart?: boolean;
  /** 日志函数 */
  logger?: (message: string, level?: 'info' | 'error' | 'warn') => void;
  /** 执行前回调 */
  onBeforeExecute?: (task: ScheduledTask) => void | Promise<void>;
  /** 执行后回调 */
  onAfterExecute?: (task: ScheduledTask, result: TaskExecutionResult) => void | Promise<void>;
}

/** 任务管理器选项 */
export interface TaskManagerOptions {
  /** 存储适配器 */
  storage: StorageAdapter;
  /** 任务执行器映射 */
  executors?: Map<TaskType, TaskExecutor>;
  /** 默认执行器 */
  defaultExecutor?: TaskExecutor;
}

/** Cron解析结果 */
export interface CronParseResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  error?: string;
  /** 解析后的字段 */
  fields?: {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  };
  /** 下次执行时间 */
  nextRun?: Date;
  /** 人类可读描述 */
  description?: string;
}
