#!/usr/bin/env node

/**
 * 定时检查并执行定时任务
 * 由系统级定时任务调用，每分钟执行一次
 */

const fs = require('fs');
const path = require('path');
const { taskManager } = require('../lib/task-manager.js');

// 创建日志目录
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 获取当前日期作为日志文件名
const today = new Date();
const logFileName = `task-scheduler-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.log`;
const logFilePath = path.join(logsDir, logFileName);

// 重写console.log，同时输出到控制台和日志文件
const originalLog = console.log;
const originalError = console.error;

console.log = function(...args) {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] ${args.join(' ')}\n`;
  
  // 输出到控制台
  originalLog.apply(console, args);
  
  // 写入日志文件
  fs.appendFileSync(logFilePath, message);
};

console.error = function(...args) {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] ERROR: ${args.join(' ')}\n`;
  
  // 输出到控制台
  originalError.apply(console, args);
  
  // 写入日志文件
  fs.appendFileSync(logFilePath, message);
};

// 解析Cron表达式，检查是否到了执行时间
function shouldExecuteTask(cronExpression) {
  const now = new Date();
  // 移除多余的空格，确保每个部分都有值
  const parts = cronExpression.trim().split(/\s+/);
  
  // 确保有5个部分
  if (parts.length !== 5) {
    console.log(`无效的Cron表达式: ${cronExpression}`);
    return false;
  }
  
  const minute = parts[0];
  const hour = parts[1];
  const dayOfMonth = parts[2];
  const month = parts[3];
  const dayOfWeek = parts[4];
  
  console.log(`解析Cron表达式: ${cronExpression}`);
  console.log(`当前时间: ${now.getHours()}:${now.getMinutes()}`);
  console.log(`计划时间: ${hour}:${minute}`);
  
  // 检查日期
  if (dayOfMonth !== '*') {
    const dayOfMonthNum = parseInt(dayOfMonth);
    if (isNaN(dayOfMonthNum) || dayOfMonthNum !== now.getDate()) {
      return false;
    }
  }
  
  // 检查月份
  if (month !== '*') {
    const monthNum = parseInt(month);
    if (isNaN(monthNum) || monthNum !== (now.getMonth() + 1)) {
      return false;
    }
  }
  
  // 检查星期
  if (dayOfWeek !== '*') {
    const dayOfWeekNum = parseInt(dayOfWeek);
    if (isNaN(dayOfWeekNum) || dayOfWeekNum !== now.getDay()) {
      return false;
    }
  }
  
  // 检查小时
  if (hour !== '*') {
    const hourNum = parseInt(hour);
    if (isNaN(hourNum) || hourNum !== now.getHours()) {
      return false;
    }
  }
  
  // 检查分钟
  if (minute !== '*') {
    const minuteNum = parseInt(minute);
    if (isNaN(minuteNum)) {
      return false;
    }
    // 检查当前分钟是否匹配计划分钟（允许1分钟的误差，避免因系统延迟错过执行）
    const currentMinute = now.getMinutes();
    if (currentMinute !== minuteNum && currentMinute !== minuteNum + 1) {
      return false;
    }
  }
  
  return true;
}

async function checkScheduledTasks() {
  console.log('开始检查定时任务...');
  
  try {
    // 获取所有任务
    const tasks = await taskManager.getAllTasks();
    console.log(`获取到 ${tasks.length} 个任务`);
    
    // 检查每个任务
    for (const task of tasks) {
      console.log(`检查任务: ${task.name}, 状态: ${task.status}, 计划: ${task.schedule}`);
      
      // 只检查激活状态的任务
      if (task.status === 'active') {
        // 检查是否到了执行时间
        if (shouldExecuteTask(task.schedule)) {
          // 检查是否已经在今天执行过
          const lastRun = task.lastRun ? new Date(task.lastRun) : null;
          const today = new Date();
          const isTodayRun = lastRun && 
            lastRun.getDate() === today.getDate() && 
            lastRun.getMonth() === today.getMonth() && 
            lastRun.getFullYear() === today.getFullYear();
          
          if (!isTodayRun) {
            console.log(`执行任务: ${task.name}`);
            const success = await taskManager.executeNewsGeneratorTask(task);
            await taskManager.updateTask(task.id, {
              lastRun: new Date().toISOString(),
              lastRunStatus: success ? 'success' : 'failed'
            });
            console.log(`任务执行完成: ${task.name}, 状态: ${success ? '成功' : '失败'}`);
          } else {
            console.log(`任务 ${task.name} 今天已经执行过，跳过`);
          }
        } else {
          console.log(`任务 ${task.name} 未到执行时间`);
        }
      } else {
        console.log(`任务 ${task.name} 未激活，跳过`);
      }
    }
    
    console.log('检查完成');
  } catch (error) {
    console.error('检查过程中出现错误:', error);
  }
}

async function main() {
  await checkScheduledTasks();
}

main();