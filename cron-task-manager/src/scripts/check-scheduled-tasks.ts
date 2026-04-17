#!/usr/bin/env node

/**
 * 定时检查脚本
 * 由系统级定时任务调用（如crontab），每分钟执行一次
 * 
 * 使用方法:
 *   * * * * * node /path/to/check-scheduled-tasks.js
 */

import { TaskManager, FileStorage } from '../core';
import path from 'path';
import fs from 'fs';

// 配置
const TASKS_DIR = process.env.TASKS_DIR || path.join(process.cwd(), 'data', 'tasks');
const LOGS_DIR = process.env.LOGS_DIR || path.join(process.cwd(), 'logs');

// 确保日志目录存在
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// 获取当前日期作为日志文件名
const today = new Date();
const logFileName = `check-tasks-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.log`;
const logFilePath = path.join(LOGS_DIR, logFileName);

// 日志函数
const log = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(logFilePath, logMessage + '\n');
};

async function main() {
  log('=================================');
  log('开始检查定时任务...');
  
  try {
    const storage = new FileStorage({ path: TASKS_DIR });
    const taskManager = new TaskManager({ storage });
    
    const now = new Date();
    log(`当前时间: ${now.toLocaleString('zh-CN')}`);
    
    // 获取待执行的任务
    const pendingTasks = await taskManager.getPendingTasks(now);
    log(`发现 ${pendingTasks.length} 个待执行任务`);
    
    for (const task of pendingTasks) {
      log(`执行任务: ${task.name}`);
      
      try {
        const result = await taskManager.executeTask(task.id);
        
        if (result.success) {
          log(`任务执行成功: ${task.name}`);
        } else {
          log(`任务执行失败: ${task.name} - ${result.error || '未知错误'}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        log(`任务执行异常: ${task.name} - ${errorMessage}`);
      }
    }
    
    log('检查完成');
    log('=================================\n');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    log(`检查过程中出现错误: ${errorMessage}`);
    process.exit(1);
  }
}

main();
