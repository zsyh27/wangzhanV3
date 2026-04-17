#!/usr/bin/env node

/**
 * 定时任务调度器脚本
 * 用于后台运行定时任务检查
 * 
 * 使用方法:
 *   node task-scheduler.js
 *   或使用 pm2: pm2 start task-scheduler.js
 */

import { TaskManager, FileStorage, CronScheduler } from '../core';
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
const logFileName = `task-scheduler-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.log`;
const logFilePath = path.join(LOGS_DIR, logFileName);

// 自定义日志函数
const logger = (message: string, level: 'info' | 'error' | 'warn' = 'info') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  // 输出到控制台
  console[level === 'error' ? 'error' : 'log'](logMessage);
  
  // 写入日志文件
  fs.appendFileSync(logFilePath, logMessage + '\n');
};

// 初始化
const storage = new FileStorage({ path: TASKS_DIR });
const taskManager = new TaskManager({ storage });

// 创建调度器
const scheduler = new CronScheduler(taskManager, {
  checkInterval: 60000, // 每分钟检查一次
  autoStart: false,
  logger,
  onBeforeExecute: async (task) => {
    logger(`开始执行任务: ${task.name}`);
  },
  onAfterExecute: async (task, result) => {
    if (result.success) {
      logger(`任务执行成功: ${task.name}`);
    } else {
      logger(`任务执行失败: ${task.name} - ${result.error || '未知错误'}`, 'error');
    }
  }
});

// 启动调度器
logger('=================================');
logger('定时任务调度器启动');
logger(`任务存储目录: ${TASKS_DIR}`);
logger(`日志文件: ${logFilePath}`);
logger('=================================');

scheduler.start();

// 处理进程退出
process.on('SIGINT', () => {
  logger('收到SIGINT信号，正在停止调度器...');
  scheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger('收到SIGTERM信号，正在停止调度器...');
  scheduler.stop();
  process.exit(0);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger(`未捕获的异常: ${error.message}`, 'error');
  scheduler.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger(`未处理的Promise拒绝: ${reason}`, 'error');
});
