import type { StorageAdapter, ScheduledTask } from '../core/types';

/**
 * 内存存储适配器
 * 用于测试和开发环境
 */
export class MemoryStorage implements StorageAdapter {
  private tasks: Map<string, ScheduledTask> = new Map();

  /**
   * 获取所有任务
   */
  async getAll(): Promise<ScheduledTask[]> {
    const tasks = Array.from(this.tasks.values());
    return tasks.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * 根据ID获取任务
   */
  async getById(id: string): Promise<ScheduledTask | null> {
    return this.tasks.get(id) || null;
  }

  /**
   * 创建任务
   */
  async create(
    taskData: Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ScheduledTask> {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    const newTask: ScheduledTask = {
      ...taskData,
      id,
      status: taskData.status || 'active',
      createdAt: now,
      updatedAt: now
    };

    this.tasks.set(id, newTask);
    return newTask;
  }

  /**
   * 更新任务
   */
  async update(
    id: string, 
    updates: Partial<ScheduledTask>
  ): Promise<ScheduledTask | null> {
    const task = this.tasks.get(id);
    
    if (!task) {
      return null;
    }

    const updatedTask: ScheduledTask = {
      ...task,
      ...updates,
      id: task.id,
      createdAt: task.createdAt,
      updatedAt: new Date().toISOString()
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  /**
   * 删除任务
   */
  async delete(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  /**
   * 清空所有任务
   */
  async clear(): Promise<void> {
    this.tasks.clear();
  }

  /**
   * 获取任务数量
   */
  async count(): Promise<number> {
    return this.tasks.size;
  }
}
