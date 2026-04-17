#!/usr/bin/env node

/**
 * 定时任务执行器
 * 用于根据cron表达式定期执行任务
 * 可通过pm2或其他进程管理工具后台运行
 */

const fs = require('fs');
const path = require('path');
const { taskManager } = require('../lib/task-manager.js');

// 模拟cron表达式解析和执行
class CronScheduler {
  constructor() {
    this.tasks = [];
    this.interval = null;
  }

  /**
   * 启动调度器
   */
  start() {
    console.log('定时任务调度器已启动');
    
    // 每分钟检查一次任务
    this.interval = setInterval(() => {
      this.checkTasks();
    }, 60000);
  }

  /**
   * 停止调度器
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('定时任务调度器已停止');
    }
  }

  /**
   * 检查并执行任务
   */
  async checkTasks() {
    try {
      const tasks = await taskManager.getAllTasks();
      const now = new Date();
      
      for (const task of tasks) {
        if (task.status === 'active' && this.shouldRun(task.schedule)) {
          // 检查是否已经在当前分钟内执行过
          if (task.lastRun) {
            const lastRunDate = new Date(task.lastRun);
            // 如果最后执行时间在当前分钟内，跳过
            if (lastRunDate.getFullYear() === now.getFullYear() &&
                lastRunDate.getMonth() === now.getMonth() &&
                lastRunDate.getDate() === now.getDate() &&
                lastRunDate.getHours() === now.getHours() &&
                lastRunDate.getMinutes() === now.getMinutes()) {
              console.log(`任务 ${task.name} 已在当前分钟内执行过，跳过`);
              continue;
            }
          }
          
          console.log(`执行任务: ${task.name} (类型: ${task.type})`);
          
          try {
            if (task.type === 'content-generator' || task.type === 'news-generator') {
              const result = await taskManager.executeContentGeneratorTask(task);
              // 更新任务的最后执行时间和微信同步状态
              await taskManager.updateTask(task.id, {
                lastRun: new Date().toISOString(),
                wechatSyncStatus: result.wechatSyncStatus,
                wechatMediaId: result.wechatMediaId,
                lastGeneratedSlug: result.slug
              });
              console.log(`任务执行成功: ${task.name}`);
            } else if (task.type === 'product-sync' || task.type === 'selection-guide-sync') {
              const result = await taskManager.executeWechatSyncTask(task);
              await taskManager.updateTask(task.id, {
                lastRun: new Date().toISOString(),
                wechatSyncStatus: result.wechatSyncStatus,
                wechatMediaId: result.wechatMediaId
              });
              console.log(`任务执行成功: ${task.name}`);
            }
          } catch (error) {
            console.error(`任务执行失败: ${task.name}`, error);
          }
        }
      }
    } catch (error) {
      console.error('检查任务失败:', error);
    }
  }

  /**
   * 判断任务是否应该在当前时间执行
   * 简化版的cron表达式解析
   */
  shouldRun(cronExpression) {
    const now = new Date();
    const parts = cronExpression.split(' ');
    
    if (parts.length !== 5) {
      return false;
    }
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    // 检查分钟
    if (!this.matches(minute, now.getMinutes())) {
      return false;
    }
    
    // 检查小时
    if (!this.matches(hour, now.getHours())) {
      return false;
    }
    
    // 检查日期
    if (!this.matches(dayOfMonth, now.getDate())) {
      return false;
    }
    
    // 检查月份
    if (!this.matches(month, now.getMonth() + 1)) {
      return false;
    }
    
    // 检查星期
    if (!this.matches(dayOfWeek, now.getDay())) {
      return false;
    }
    
    return true;
  }

  /**
   * 检查值是否匹配cron表达式的部分
   */
  matches(expression, value) {
    if (expression === '*') {
      return true;
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
    
    // 处理步长，如 */5
    if (expression.includes('/')) {
      const [range, step] = expression.split('/');
      if (range === '*') {
        return value % Number(step) === 0;
      }
    }
    
    return Number(expression) === value;
  }
}

// 启动调度器
const scheduler = new CronScheduler();
scheduler.start();

// 处理进程退出
process.on('SIGINT', () => {
  scheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  scheduler.stop();
  process.exit(0);
});
