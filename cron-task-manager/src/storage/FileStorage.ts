import fs from 'fs';
import path from 'path';
import type { StorageAdapter, ScheduledTask } from '../core/types';

/**
 * 文件存储适配器
 * 使用JSON文件存储定时任务数据
 */
export class FileStorage implements StorageAdapter {
  private tasksDir: string;

  constructor(options?: { path?: string }) {
    this.tasksDir = options?.path || path.join(process.cwd(), 'data', 'tasks');
    this.ensureDirectory();
  }

  /**
   * 确保存储目录存在
   */
  private ensureDirectory(): void {
    if (!fs.existsSync(this.tasksDir)) {
      fs.mkdirSync(this.tasksDir, { recursive: true });
    }
  }

  /**
   * 获取所有任务
   */
  async getAll(): Promise<ScheduledTask[]> {
    try {
      const files = fs.readdirSync(this.tasksDir);
      const tasks: ScheduledTask[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.tasksDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const task = JSON.parse(content) as ScheduledTask;
          tasks.push(task);
        }
      }

      // 按创建时间排序
      return tasks.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('获取任务列表失败:', error);
      return [];
    }
  }

  /**
   * 根据ID获取任务
   */
  async getById(id: string): Promise<ScheduledTask | null> {
    try {
      const filePath = path.join(this.tasksDir, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content) as ScheduledTask;
    } catch (error) {
      console.error(`获取任务 ${id} 失败:`, error);
      return null;
    }
  }

  /**
   * 创建任务
   */
  async create(
    taskData: Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ScheduledTask> {
    try {
      const id = Date.now().toString();
      const now = new Date().toISOString();
      
      const newTask: ScheduledTask = {
        ...taskData,
        id,
        status: taskData.status || 'active',
        createdAt: now,
        updatedAt: now
      };

      const filePath = path.join(this.tasksDir, `${id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(newTask, null, 2));

      return newTask;
    } catch (error) {
      console.error('创建任务失败:', error);
      throw error;
    }
  }

  /**
   * 更新任务
   */
  async update(
    id: string, 
    updates: Partial<ScheduledTask>
  ): Promise<ScheduledTask | null> {
    try {
      const filePath = path.join(this.tasksDir, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const task = JSON.parse(content) as ScheduledTask;

      const updatedTask: ScheduledTask = {
        ...task,
        ...updates,
        id: task.id, // 确保ID不被修改
        createdAt: task.createdAt, // 确保创建时间不被修改
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(filePath, JSON.stringify(updatedTask, null, 2));
      return updatedTask;
    } catch (error) {
      console.error(`更新任务 ${id} 失败:`, error);
      return null;
    }
  }

  /**
   * 删除任务
   */
  async delete(id: string): Promise<boolean> {
    try {
      const filePath = path.join(this.tasksDir, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return false;
      }

      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      console.error(`删除任务 ${id} 失败:`, error);
      return false;
    }
  }

  /**
   * 获取存储目录路径
   */
  getStoragePath(): string {
    return this.tasksDir;
  }

  /**
   * 备份所有任务
   */
  async backup(backupDir?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = backupDir || path.join(this.tasksDir, 'backups');
    const backupFile = path.join(backupPath, `tasks-backup-${timestamp}.json`);

    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    const tasks = await this.getAll();
    fs.writeFileSync(backupFile, JSON.stringify(tasks, null, 2));

    return backupFile;
  }
}
