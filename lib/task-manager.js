const fs = require('fs');
const path = require('path');
// 启用微信服务号相关功能
// 注意：由于 wechat.ts 是 TypeScript 文件，在 Node.js 环境中直接 require 会失败
// 这里我们暂时注释掉，只在 Next.js 环境中使用微信服务号功能
// const { wechatService } = require('./wechat.ts');

const TASKS_DIR = path.join(process.cwd(), 'content', 'tasks');

class TaskManager {
  constructor() {
    // 确保任务目录存在
    if (!fs.existsSync(TASKS_DIR)) {
      fs.mkdirSync(TASKS_DIR, { recursive: true });
    }
  }

  /**
   * 获取所有定时任务
   */
  async getAllTasks() {
    try {
      const files = fs.readdirSync(TASKS_DIR);
      const tasks = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(TASKS_DIR, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const task = JSON.parse(content);
          tasks.push(task);
        }
      }

      return tasks;
    } catch (error) {
      console.error('获取任务列表失败:', error);
      return [];
    }
  }

  /**
   * 创建定时任务
   */
  async createTask(task) {
    try {
      const id = Date.now().toString();
      const now = new Date().toISOString();
      
      const newTask = {
        ...task,
        id,
        createdAt: now,
        updatedAt: now
      };

      const filePath = path.join(TASKS_DIR, `${id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(newTask, null, 2));

      return newTask;
    } catch (error) {
      console.error('创建任务失败:', error);
      throw error;
    }
  }

  /**
   * 更新定时任务
   */
  async updateTask(id, updates) {
    try {
      const filePath = path.join(TASKS_DIR, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const task = JSON.parse(content);

      const updatedTask = {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(filePath, JSON.stringify(updatedTask, null, 2));
      return updatedTask;
    } catch (error) {
      console.error('更新任务失败:', error);
      return null;
    }
  }

  /**
   * 删除定时任务
   */
  async deleteTask(id) {
    try {
      const filePath = path.join(TASKS_DIR, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return false;
      }

      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      console.error('删除任务失败:', error);
      return false;
    }
  }

  /**
   * 执行内容生成任务
   */
  async executeContentGeneratorTask(task) {
    try {
      console.log('执行内容生成任务，参数:', task);
      // 导入并执行AI内容生成脚本
      const { main } = require('../scripts/ai-content-generate.js');
      // 传递任务类型参数给AI内容生成脚本
      const result = await main(task?.taskType);
      
      // 返回执行结果，包含微信同步状态
      return {
        success: result.success,
        wechatSyncStatus: result.wechatSyncStatus || 'failed',
        wechatMediaId: result.wechatMediaId || '',
        slug: result.slug || ''
      };
    } catch (error) {
      console.error('执行新闻生成任务失败:', error);
      return {
        success: false,
        wechatSyncStatus: 'failed',
        error: error.message
      };
    }
  }

}

const taskManager = new TaskManager();

module.exports = {
  taskManager
};
