#!/usr/bin/env node

/**
 * 定时任务管理器测试脚本
 * 测试核心功能：CRUD、Cron表达式解析、调度器
 */

const { TaskManager, MemoryStorage, CronScheduler, FileStorage } = require('./dist/core');
const path = require('path');

// 测试配置
const TEST_DATA_DIR = path.join(__dirname, 'test-data', 'tasks');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, type = 'info') {
  const color = type === 'success' ? colors.green : 
                type === 'error' ? colors.red : 
                type === 'warning' ? colors.yellow : colors.blue;
  console.log(`${color}[${type.toUpperCase()}]${colors.reset} ${message}`);
}

// 测试计数
let passed = 0;
let failed = 0;

async function assert(condition, message) {
  if (condition) {
    log(`✓ ${message}`, 'success');
    passed++;
  } else {
    log(`✗ ${message}`, 'error');
    failed++;
  }
}

// 测试1: MemoryStorage CRUD
async function testMemoryStorage() {
  log('\n========== 测试 MemoryStorage ==========', 'info');
  
  const storage = new MemoryStorage();
  
  // 创建任务
  const task1 = await storage.create({
    name: '测试任务1',
    type: 'custom',
    schedule: '0 8 * * *',
    status: 'active'
  });
  await assert(task1.id !== undefined, '创建任务应返回ID');
  await assert(task1.name === '测试任务1', '任务名称应正确');
  
  // 获取所有任务
  const tasks = await storage.getAll();
  await assert(tasks.length === 1, '应返回1个任务');
  
  // 根据ID获取
  const found = await storage.getById(task1.id);
  await assert(found !== null, '应能找到任务');
  await assert(found.name === '测试任务1', '找到的任务名称应正确');
  
  // 更新任务
  const updated = await storage.update(task1.id, { name: '更新后的任务' });
  await assert(updated.name === '更新后的任务', '任务名称应已更新');
  
  // 删除任务
  const deleted = await storage.delete(task1.id);
  await assert(deleted === true, '删除应成功');
  
  const tasksAfterDelete = await storage.getAll();
  await assert(tasksAfterDelete.length === 0, '删除后应无任务');
  
  log('MemoryStorage 测试完成', 'success');
}

// 测试2: TaskManager 功能
async function testTaskManager() {
  log('\n========== 测试 TaskManager ==========', 'info');
  
  const storage = new MemoryStorage();
  const taskManager = new TaskManager({ storage });
  
  // 测试 Cron 表达式验证
  await assert(taskManager.isValidCronExpression('0 8 * * *') === true, '有效Cron应返回true');
  await assert(taskManager.isValidCronExpression('invalid') === false, '无效Cron应返回false');
  await assert(taskManager.isValidCronExpression('* * * *') === false, '不完整Cron应返回false');
  
  // 创建任务
  const task = await taskManager.createTask({
    name: '每日备份',
    type: 'custom',
    schedule: '0 2 * * *',
    status: 'active'
  });
  await assert(task.id !== undefined, '创建任务应成功');
  
  // 测试 shouldRun
  const testDate = new Date('2024-01-15T02:00:00'); // 周一 2:00
  await assert(taskManager.shouldRun('0 2 * * *', testDate) === true, '2:00应匹配0 2 * * *');
  await assert(taskManager.shouldRun('0 3 * * *', testDate) === false, '2:00不应匹配0 3 * * *');
  await assert(taskManager.shouldRun('0 2 * * 1', testDate) === true, '周一2:00应匹配0 2 * * 1');
  
  // 测试获取下次执行时间
  const nextRun = taskManager.getNextRunTime('0 2 * * *', new Date('2024-01-15T00:00:00'));
  await assert(nextRun !== null, '应能计算下次执行时间');
  await assert(nextRun.getHours() === 2, '下次执行时间应为2点');
  
  // 获取所有任务
  const allTasks = await taskManager.getAllTasks();
  await assert(allTasks.length === 1, '应返回1个任务');
  
  // 更新任务状态
  await taskManager.deactivateTask(task.id);
  const deactivated = await taskManager.getTaskById(task.id);
  await assert(deactivated.status === 'inactive', '任务应已禁用');
  
  await taskManager.activateTask(task.id);
  const activated = await taskManager.getTaskById(task.id);
  await assert(activated.status === 'active', '任务应已启用');
  
  // 删除任务
  await taskManager.deleteTask(task.id);
  const afterDelete = await taskManager.getAllTasks();
  await assert(afterDelete.length === 0, '删除后应无任务');
  
  log('TaskManager 测试完成', 'success');
}

// 测试3: CronScheduler
async function testCronScheduler() {
  log('\n========== 测试 CronScheduler ==========', 'info');
  
  const storage = new MemoryStorage();
  const taskManager = new TaskManager({ storage });
  
  // 创建一个即将执行的任务（当前时间的下一分钟）
  const now = new Date();
  const nextMinute = new Date(now.getTime() + 60000);
  const cronExpr = `${nextMinute.getMinutes()} ${nextMinute.getHours()} ${nextMinute.getDate()} ${nextMinute.getMonth() + 1} ${nextMinute.getDay()}`;
  
  await taskManager.createTask({
    name: '调度测试任务',
    type: 'custom',
    schedule: cronExpr,
    status: 'active'
  });
  
  let executed = false;
  
  const scheduler = new CronScheduler(taskManager, {
    checkInterval: 1000, // 1秒检查一次，用于测试
    autoStart: false,
    onBeforeExecute: async (task) => {
      log(`准备执行: ${task.name}`, 'info');
    },
    onAfterExecute: async (task, result) => {
      log(`执行完成: ${task.name}, 结果: ${result.success}`, 'success');
      executed = true;
    }
  });
  
  await assert(scheduler.running() === false, '调度器初始状态应为停止');
  
  scheduler.start();
  await assert(scheduler.running() === true, '调度器应已启动');
  
  // 等待2秒让调度器检查
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  scheduler.stop();
  await assert(scheduler.running() === false, '调度器应已停止');
  
  log('CronScheduler 测试完成', 'success');
}

// 测试4: FileStorage
async function testFileStorage() {
  log('\n========== 测试 FileStorage ==========', 'info');
  
  // 清理测试目录
  const fs = require('fs');
  if (fs.existsSync(TEST_DATA_DIR)) {
    fs.rmSync(TEST_DATA_DIR, { recursive: true });
  }
  
  const storage = new FileStorage({ path: TEST_DATA_DIR });
  
  // 创建任务
  const task = await storage.create({
    name: '文件存储测试',
    type: 'custom',
    schedule: '0 8 * * *',
    status: 'active'
  });
  
  await assert(task.id !== undefined, '文件存储创建任务应成功');
  await assert(fs.existsSync(TEST_DATA_DIR), '存储目录应已创建');
  
  // 验证文件存在
  const taskFile = path.join(TEST_DATA_DIR, `${task.id}.json`);
  await assert(fs.existsSync(taskFile), '任务文件应存在');
  
  // 读取验证
  const content = fs.readFileSync(taskFile, 'utf8');
  const savedTask = JSON.parse(content);
  await assert(savedTask.name === '文件存储测试', '文件内容应正确');
  
  // 获取所有任务
  const tasks = await storage.getAll();
  await assert(tasks.length === 1, '应返回1个任务');
  
  // 更新
  await storage.update(task.id, { name: '已更新' });
  const updatedContent = fs.readFileSync(taskFile, 'utf8');
  const updatedTask = JSON.parse(updatedContent);
  await assert(updatedTask.name === '已更新', '文件内容应已更新');
  
  // 删除
  await storage.delete(task.id);
  await assert(!fs.existsSync(taskFile), '任务文件应已删除');
  
  // 清理
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  
  log('FileStorage 测试完成', 'success');
}

// 运行所有测试
async function runTests() {
  log('=================================', 'info');
  log('开始测试定时任务管理器', 'info');
  log('=================================\n', 'info');
  
  try {
    await testMemoryStorage();
    await testFileStorage();
    await testTaskManager();
    await testCronScheduler();
    
    log('\n=================================', 'info');
    log('测试完成', 'success');
    log(`通过: ${passed}`, 'success');
    log(`失败: ${failed}`, failed > 0 ? 'error' : 'success');
    log('=================================', 'info');
    
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    log(`测试过程中出现错误: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

runTests();
