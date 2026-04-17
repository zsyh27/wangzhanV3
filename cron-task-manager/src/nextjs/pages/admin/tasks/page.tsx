'use client';

import { useState, useEffect } from 'react';
import type { ScheduledTask } from '../../../../core';

const taskTypes = ['产品内容生成', '行业动态', '技术知识库'];

export default function TaskManagerPage() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    schedule: '',
    status: 'active' as 'active' | 'inactive',
    taskType: '产品内容生成',
    type: 'content-generator' as const
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        setMessage('定时任务创建成功');
        setShowForm(false);
        setNewTask({
          name: '',
          schedule: '',
          status: 'active',
          taskType: '产品内容生成',
          type: 'content-generator'
        });
        fetchTasks();
      } else {
        setMessage('创建任务失败，请重试');
      }
    } catch (error) {
      setMessage('创建任务失败，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个任务吗？')) return;
    
    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('任务删除成功');
        fetchTasks();
      } else {
        setMessage('删除任务失败，请重试');
      }
    } catch (error) {
      setMessage('删除任务失败，请重试');
    }
  };

  const handleExecute = async (id: string) => {
    try {
      const response = await fetch('/api/tasks/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        const data = await response.json();
        let msg = '任务执行成功';
        if (data.wechatSyncStatus === 'success') {
          msg = '任务执行成功，微信同步完成';
        } else if (data.wechatSyncStatus === 'failed') {
          msg = '任务执行成功，微信同步失败';
        }
        setMessage(msg);
        fetchTasks();
      } else {
        setMessage('任务执行失败，请重试');
      }
    } catch (error) {
      setMessage('任务执行失败，请重试');
    }
  };

  const getOneMinuteLaterCron = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return `${now.getMinutes()} ${now.getHours()} ${now.getDate()} ${now.getMonth() + 1} ${now.getDay()}`;
  };

  const handleQuickCreate = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    
    setNewTask({
      name: `测试任务-${timeStr}`,
      schedule: getOneMinuteLaterCron(),
      status: 'active',
      taskType: '行业动态',
      type: 'content-generator'
    });
    setShowForm(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">定时任务管理</h1>
  
      {message && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">任务列表</h2>
        <div className="space-x-3">
          <button
            onClick={handleQuickCreate}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            快速创建测试任务
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {showForm ? '取消' : '创建任务'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-6 border rounded-lg bg-gray-50">
          <div>
            <label className="block mb-2 font-medium">任务名称</label>
            <input
              type="text"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">执行计划 (Cron表达式)</label>
            <input
              type="text"
              value={newTask.schedule}
              onChange={(e) => setNewTask({ ...newTask, schedule: e.target.value })}
              placeholder="例如: 0 0 * * 0 (每周日执行)"
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">状态</label>
            <select
              value={newTask.status}
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">任务类型</label>
            <select
              value={newTask.taskType}
              onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            >
              {taskTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
            >
              保存任务
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">任务名称</th>
              <th className="border px-4 py-2 text-left">执行计划</th>
              <th className="border px-4 py-2 text-left">状态</th>
              <th className="border px-4 py-2 text-left">最后执行</th>
              <th className="border px-4 py-2 text-left">微信同步</th>
              <th className="border px-4 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="border px-4 py-4 text-center text-gray-500">
                  暂无定时任务
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td className="border px-4 py-2">{task.name}</td>
                  <td className="border px-4 py-2 font-mono text-sm">{task.schedule}</td>
                  <td className="border px-4 py-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      task.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="border px-4 py-2">
                    {task.lastRun 
                      ? new Date(task.lastRun).toLocaleString('zh-CN') 
                      : '从未执行'}
                  </td>
                  <td className="border px-4 py-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      task.wechatSyncStatus === 'success' ? 'bg-green-100 text-green-800' :
                      task.wechatSyncStatus === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.wechatSyncStatus === 'success' ? '同步完成' :
                       task.wechatSyncStatus === 'failed' ? '同步失败' :
                       '未执行'}
                    </span>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleExecute(task.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                      >
                        立即执行
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Cron表达式说明</h3>
        <div className="bg-gray-50 p-4 rounded text-sm">
          <p className="mb-2"><strong>格式:</strong> 分 时 日 月 周</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><code>30 8 * * *</code> - 每天8:30执行</li>
            <li><code>0 12 * * 1-5</code> - 工作日12:00执行</li>
            <li><code>0 0 1 * *</code> - 每月1日0:00执行</li>
            <li><code>*/15 * * * *</code> - 每15分钟执行一次</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
