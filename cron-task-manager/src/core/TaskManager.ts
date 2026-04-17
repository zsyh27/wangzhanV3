import type {
  ScheduledTask,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskExecutionResult,
  StorageAdapter,
  TaskExecutor,
  TaskType,
  TaskManagerOptions
} from './types';

/**
 * 任务管理器
 * 负责任务的CRUD操作和执行管理
 */
export class TaskManager {
  private storage: StorageAdapter;
  private executors: Map<TaskType, TaskExecutor>;
  private defaultExecutor?: TaskExecutor;

  constructor(options: TaskManagerOptions) {
    this.storage = options.storage;
    this.executors = options.executors || new Map();
    this.defaultExecutor = options.defaultExecutor;
  }

  /**
   * 注册任务执行器
   */
  registerExecutor(type: TaskType, executor: TaskExecutor): void {
    this.executors.set(type, executor);
  }

  /**
   * 设置默认执行器
   */
  setDefaultExecutor(executor: TaskExecutor): void {
    this.defaultExecutor = executor;
  }

  /**
   * 获取所有任务
   */
  async getAllTasks(): Promise<ScheduledTask[]> {
    return this.storage.getAll();
  }

  /**
   * 根据ID获取任务
   */
  async getTaskById(id: string): Promise<ScheduledTask | null> {
    return this.storage.getById(id);
  }

  /**
   * 创建任务
   */
  async createTask(taskData: CreateTaskDTO): Promise<ScheduledTask> {
    // 验证Cron表达式
    if (!this.isValidCronExpression(taskData.schedule)) {
      throw new Error(`无效的Cron表达式: ${taskData.schedule}`);
    }

    return this.storage.create({
      ...taskData,
      status: taskData.status || 'active'
    });
  }

  /**
   * 更新任务
   */
  async updateTask(id: string, updates: UpdateTaskDTO): Promise<ScheduledTask | null> {
    // 如果更新了schedule，验证其有效性
    if (updates.schedule && !this.isValidCronExpression(updates.schedule)) {
      throw new Error(`无效的Cron表达式: ${updates.schedule}`);
    }

    return this.storage.update(id, updates);
  }

  /**
   * 删除任务
   */
  async deleteTask(id: string): Promise<boolean> {
    return this.storage.delete(id);
  }

  /**
   * 启用任务
   */
  async activateTask(id: string): Promise<ScheduledTask | null> {
    return this.storage.update(id, { status: 'active' });
  }

  /**
   * 禁用任务
   */
  async deactivateTask(id: string): Promise<ScheduledTask | null> {
    return this.storage.update(id, { status: 'inactive' });
  }

  /**
   * 执行任务
   */
  async executeTask(id: string): Promise<TaskExecutionResult> {
    const task = await this.storage.getById(id);
    
    if (!task) {
      return {
        success: false,
        error: '任务不存在'
      };
    }

    // 更新任务状态为运行中
    await this.storage.update(id, { 
      lastRunStatus: 'running',
      lastRun: new Date().toISOString()
    });

    try {
      const result = await this.executeTaskInternal(task);
      
      // 更新任务执行结果
      await this.storage.update(id, {
        lastRunStatus: result.success ? 'success' : 'failed',
        wechatSyncStatus: result.wechatSyncStatus,
        wechatMediaId: result.wechatMediaId,
        lastGeneratedSlug: result.slug
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      
      // 更新任务失败状态
      await this.storage.update(id, {
        lastRunStatus: 'failed'
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 内部执行任务
   */
  private async executeTaskInternal(task: ScheduledTask): Promise<TaskExecutionResult> {
    // 查找对应的执行器
    const executor = this.executors.get(task.type) || this.defaultExecutor;

    if (!executor) {
      return {
        success: false,
        error: `未找到类型为 "${task.type}" 的任务执行器`
      };
    }

    return executor.execute(task);
  }

  /**
   * 执行特定类型的所有任务
   */
  async executeTasksByType(type: TaskType): Promise<TaskExecutionResult[]> {
    const tasks = await this.storage.getAll();
    const filteredTasks = tasks.filter(t => t.type === type && t.status === 'active');

    const results: TaskExecutionResult[] = [];
    for (const task of filteredTasks) {
      const result = await this.executeTask(task.id);
      results.push(result);
    }

    return results;
  }

  /**
   * 获取待执行的任务列表
   * 根据当前时间和Cron表达式判断
   */
  async getPendingTasks(currentTime: Date = new Date()): Promise<ScheduledTask[]> {
    const tasks = await this.storage.getAll();
    
    return tasks.filter(task => {
      if (task.status !== 'active') {
        return false;
      }

      // 检查是否在当前分钟内已经执行过
      if (task.lastRun) {
        const lastRun = new Date(task.lastRun);
        if (
          lastRun.getFullYear() === currentTime.getFullYear() &&
          lastRun.getMonth() === currentTime.getMonth() &&
          lastRun.getDate() === currentTime.getDate() &&
          lastRun.getHours() === currentTime.getHours() &&
          lastRun.getMinutes() === currentTime.getMinutes()
        ) {
          return false;
        }
      }

      return this.shouldRun(task.schedule, currentTime);
    });
  }

  /**
   * 验证Cron表达式是否有效
   */
  isValidCronExpression(expression: string): boolean {
    const parts = expression.trim().split(/\s+/);
    
    if (parts.length !== 5) {
      return false;
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // 基本格式验证
    const isValidField = (field: string, min: number, max: number): boolean => {
      if (field === '*') return true;
      if (field.includes('/')) {
        const [range, step] = field.split('/');
        if (range !== '*' && isNaN(Number(range))) return false;
        if (isNaN(Number(step))) return false;
        return true;
      }
      if (field.includes('-')) {
        const [start, end] = field.split('-');
        const startNum = Number(start);
        const endNum = Number(end);
        return !isNaN(startNum) && !isNaN(endNum) && startNum >= min && endNum <= max;
      }
      if (field.includes(',')) {
        const values = field.split(',');
        return values.every(v => {
          const num = Number(v);
          return !isNaN(num) && num >= min && num <= max;
        });
      }
      const num = Number(field);
      return !isNaN(num) && num >= min && num <= max;
    };

    return (
      isValidField(minute, 0, 59) &&
      isValidField(hour, 0, 23) &&
      isValidField(dayOfMonth, 1, 31) &&
      isValidField(month, 1, 12) &&
      isValidField(dayOfWeek, 0, 6)
    );
  }

  /**
   * 判断任务是否应该在指定时间执行
   */
  shouldRun(cronExpression: string, date: Date = new Date()): boolean {
    const parts = cronExpression.trim().split(/\s+/);
    
    if (parts.length !== 5) {
      return false;
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    const matches = (expression: string, value: number, min: number, max: number): boolean => {
      if (expression === '*') return true;

      // 处理步长，如 */5
      if (expression.includes('/')) {
        const [range, step] = expression.split('/');
        if (range === '*') {
          return value % Number(step) === 0;
        }
        return false;
      }

      // 处理范围，如 1-5
      if (expression.includes('-')) {
        const [start, end] = expression.split('-').map(Number);
        return value >= start && value <= end;
      }

      // 处理列表，如 1,3,5
      if (expression.includes(',')) {
        const values = expression.split(',').map(Number);
        return values.includes(value);
      }

      return Number(expression) === value;
    };

    return (
      matches(minute, date.getMinutes(), 0, 59) &&
      matches(hour, date.getHours(), 0, 23) &&
      matches(dayOfMonth, date.getDate(), 1, 31) &&
      matches(month, date.getMonth() + 1, 1, 12) &&
      matches(dayOfWeek, date.getDay(), 0, 6)
    );
  }

  /**
   * 获取下次执行时间
   */
  getNextRunTime(cronExpression: string, after: Date = new Date()): Date | null {
    // 简化实现：从after开始，每分钟检查一次，最多检查1年
    const maxChecks = 60 * 24 * 365; // 1年的分钟数
    const checkDate = new Date(after);
    checkDate.setMinutes(checkDate.getMinutes() + 1);
    checkDate.setSeconds(0);
    checkDate.setMilliseconds(0);

    for (let i = 0; i < maxChecks; i++) {
      if (this.shouldRun(cronExpression, checkDate)) {
        return new Date(checkDate);
      }
      checkDate.setMinutes(checkDate.getMinutes() + 1);
    }

    return null;
  }
}
