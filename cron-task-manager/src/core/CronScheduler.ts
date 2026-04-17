import type { TaskManager } from './TaskManager';
import type { ScheduledTask, SchedulerOptions, TaskExecutionResult } from './types';

/**
 * Cron调度器
 * 负责定时检查并执行任务
 */
export class CronScheduler {
  private taskManager: TaskManager;
  private options: Required<SchedulerOptions>;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(taskManager: TaskManager, options: SchedulerOptions = {}) {
    this.taskManager = taskManager;
    this.options = {
      checkInterval: options.checkInterval || 60000, // 默认1分钟
      autoStart: options.autoStart ?? false,
      logger: options.logger || ((msg: string, level = 'info') => {
        const timestamp = new Date().toISOString();
        console[level === 'error' ? 'error' : 'log'](`[${timestamp}] [${level.toUpperCase()}] ${msg}`);
      }),
      onBeforeExecute: options.onBeforeExecute || (() => {}),
      onAfterExecute: options.onAfterExecute || (() => {})
    };

    if (this.options.autoStart) {
      this.start();
    }
  }

  /**
   * 启动调度器
   */
  start(): void {
    if (this.isRunning) {
      this.options.logger('调度器已经在运行中', 'warn');
      return;
    }

    this.isRunning = true;
    this.options.logger('定时任务调度器已启动');

    // 立即执行一次检查
    this.checkAndExecute();

    // 设置定时检查
    this.intervalId = setInterval(() => {
      this.checkAndExecute();
    }, this.options.checkInterval);
  }

  /**
   * 停止调度器
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    this.options.logger('定时任务调度器已停止');
  }

  /**
   * 检查并执行待执行任务
   */
  private async checkAndExecute(): Promise<void> {
    const now = new Date();
    
    try {
      const pendingTasks = await this.taskManager.getPendingTasks(now);

      if (pendingTasks.length > 0) {
        this.options.logger(`发现 ${pendingTasks.length} 个待执行任务`);
      }

      for (const task of pendingTasks) {
        await this.executeTask(task);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      this.options.logger(`检查任务失败: ${errorMessage}`, 'error');
    }
  }

  /**
   * 执行单个任务
   */
  private async executeTask(task: ScheduledTask): Promise<void> {
    this.options.logger(`准备执行任务: ${task.name}`);

    try {
      // 执行前回调
      await this.options.onBeforeExecute(task);

      // 执行任务
      const result = await this.taskManager.executeTask(task.id);

      // 执行后回调
      await this.options.onAfterExecute(task, result);

      if (result.success) {
        this.options.logger(`任务执行成功: ${task.name}`);
      } else {
        this.options.logger(`任务执行失败: ${task.name} - ${result.error || '未知错误'}`, 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      this.options.logger(`任务执行异常: ${task.name} - ${errorMessage}`, 'error');
    }
  }

  /**
   * 立即触发一次检查（用于测试）
   */
  async triggerCheck(): Promise<void> {
    this.options.logger('手动触发任务检查');
    await this.checkAndExecute();
  }

  /**
   * 获取调度器状态
   */
  getStatus(): {
    isRunning: boolean;
    checkInterval: number;
    nextCheckIn: number;
  } {
    // 这里简化处理，实际应该记录上次检查时间
    return {
      isRunning: this.isRunning,
      checkInterval: this.options.checkInterval,
      nextCheckIn: this.isRunning ? this.options.checkInterval : 0
    };
  }

  /**
   * 检查调度器是否正在运行
   */
  running(): boolean {
    return this.isRunning;
  }
}

/**
 * 创建并启动调度器（快捷方法）
 */
export function createScheduler(
  taskManager: TaskManager, 
  options?: SchedulerOptions
): CronScheduler {
  return new CronScheduler(taskManager, options);
}
