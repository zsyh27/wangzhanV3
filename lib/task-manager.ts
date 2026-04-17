/**
 * 任务管理器 - 重新导出自 cron-task-manager 包
 * 
 * 此文件现在作为 cron-task-manager 包的兼容层，
 * 保持原有接口不变，但底层实现使用新包。
 */

import { TaskManager as NewTaskManager, FileStorage } from '../cron-task-manager/dist/core';
import type { ScheduledTask as NewScheduledTask, CreateTaskDTO } from '../cron-task-manager/dist/core';
import path from 'path';
import { syncMarkdownToWechat } from './wechat-sync';

// 为了保持兼容性，扩展新包的类型
interface ScheduledTask extends NewScheduledTask {
  // 保持与原接口兼容
}

// 存储路径保持与原项目一致
const TASKS_DIR = path.join(process.cwd(), 'content', 'tasks');

// 创建存储实例
const storage = new FileStorage({ path: TASKS_DIR });

// 创建新包的任务管理器实例
const newTaskManager = new NewTaskManager({ storage });

/**
 * 兼容旧接口的任务管理器类
 */
class TaskManager {
  private inner: NewTaskManager;

  constructor() {
    this.inner = newTaskManager;
  }

  /**
   * 获取所有定时任务
   */
  async getAllTasks(): Promise<ScheduledTask[]> {
    return this.inner.getAllTasks() as Promise<ScheduledTask[]>;
  }

  /**
   * 创建定时任务
   */
  async createTask(task: Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScheduledTask> {
    const taskData: CreateTaskDTO = {
      name: task.name,
      type: task.type === 'news-generator' ? 'news-generator' : 'custom',
      schedule: task.schedule,
      status: task.status
    };
    return this.inner.createTask(taskData) as Promise<ScheduledTask>;
  }

  /**
   * 更新定时任务
   */
  async updateTask(id: string, updates: Partial<ScheduledTask>): Promise<ScheduledTask | null> {
    return this.inner.updateTask(id, updates) as Promise<ScheduledTask | null>;
  }

  /**
   * 删除定时任务
   */
  async deleteTask(id: string): Promise<boolean> {
    return this.inner.deleteTask(id);
  }

  /**
   * 执行新闻生成任务
   * @deprecated 建议使用新的任务执行器机制
   */
  async executeNewsGeneratorTask(): Promise<boolean> {
    try {
      // 导入并执行AI内容生成脚本
      const { main } = require('../scripts/ai-content-generate.js');
      await main();
      return true;
    } catch (error) {
      console.error('执行新闻生成任务失败:', error);
      return false;
    }
  }

  /**
   * 执行内容生成任务（兼容新方法）
   */
  async executeContentGeneratorTask(task?: any): Promise<{
    success: boolean;
    wechatSyncStatus?: string;
    wechatMediaId?: string;
    slug?: string;
    error?: string;
  }> {
    try {
      const { main } = require('../scripts/ai-content-generate.js');
      const result = await main(task?.taskType);
      return {
        success: result.success,
        wechatSyncStatus: result.wechatSyncStatus || 'failed',
        wechatMediaId: result.wechatMediaId || '',
        slug: result.slug || ''
      };
    } catch (error) {
      console.error('执行内容生成任务失败:', error);
      return {
        success: false,
        wechatSyncStatus: 'failed',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 执行微信同步任务
   */
  async executeWechatSyncTask(task?: any): Promise<{
    success: boolean;
    wechatSyncStatus?: string;
    wechatMediaId?: string;
    fileName?: string;
    message?: string;
    error?: string;
  }> {
    try {
      const typeMap: Record<string, string> = {
        'product-sync': 'content/products',
        'selection-guide-sync': 'content/selection-guide',
        'news-sync': 'content/news'
      };

      const taskType = task?.type || task?.taskType;
      const directory = typeMap[taskType];

      if (!directory) {
        return {
          success: false,
          wechatSyncStatus: 'failed',
          error: `不支持的任务类型: ${taskType}`
        };
      }

      const result = await syncMarkdownToWechat(directory, task?.targetFile);

      return {
        success: result.success,
        wechatSyncStatus: result.success ? 'success' : 'failed',
        wechatMediaId: result.mediaId,
        fileName: result.fileName,
        message: result.message,
        error: result.error
      };

    } catch (error) {
      console.error('执行微信同步任务失败:', error);
      return {
        success: false,
        wechatSyncStatus: 'failed',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
}

// 导出单例实例（保持与原接口兼容）
export const taskManager = new TaskManager();

// 额外导出类型和新包功能（供新项目使用）
export type { ScheduledTask };
export { TaskManager };

// 重新导出 cron-task-manager 的核心功能
export { 
  TaskManager as NewTaskManager,
  FileStorage, 
  MemoryStorage,
  CronScheduler,
  createScheduler 
} from '../cron-task-manager/dist/core';

export type { 
  CreateTaskDTO, 
  UpdateTaskDTO, 
  TaskExecutionResult,
  TaskStatus,
  TaskType,
  StorageAdapter,
  TaskExecutor,
  SchedulerOptions
} from '../cron-task-manager/dist/core';
