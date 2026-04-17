'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AdminPage() {
  const [message, setMessage] = useState('')
  const [tasks, setTasks] = useState<any[]>([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [newTask, setNewTask] = useState({
    name: '',
    schedule: '',
    status: 'active' as 'active' | 'inactive',
    taskType: 'product-sync'
  })
  
  const [wechatConfigured, setWechatConfigured] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks')
  const taskTypes = [
    { value: 'product-sync', label: '产品文章同步', description: '从content/products随机选择md同步微信' },
    { value: 'selection-guide-sync', label: '技术文章同步', description: '从content/selection-guide随机选择md同步微信' },
    { value: 'news-generator', label: '行业动态生成', description: 'AI生成行业动态文章（政策/市场/展会）并自动同步' }
  ]

  useEffect(() => {
    fetchTasks()
    
    const checkWechatConfig = async () => {
      try {
        const response = await fetch('/api/wechat/config')
        const data = await response.json()
        if (data.success) {
          setWechatConfigured(data.configured)
        }
      } catch (error) {
        console.error('检查微信配置失败:', error)
      }
    }
    
    checkWechatConfig()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()
      if (data.success) {
        setTasks(data.data)
      }
    } catch (error) {
      console.error('获取任务列表失败:', error)
    }
  }

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTask.name,
          type: newTask.taskType,
          schedule: newTask.schedule,
          status: newTask.status,
          taskType: newTask.taskType
        }),
      })

      if (response.ok) {
        setMessage('定时任务创建成功')
        setShowTaskForm(false)
        setNewTask({ name: '', schedule: '', status: 'active', taskType: 'product-sync' })
        fetchTasks()
      } else {
        setMessage('创建任务失败，请重试')
      }
    } catch (error) {
      setMessage('创建任务失败，请重试')
    }
  }

  const handleTaskDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage('任务删除成功')
        fetchTasks()
      } else {
        setMessage('删除任务失败，请重试')
      }
    } catch (error) {
      setMessage('删除任务失败，请重试')
    }
  }

  const handleTaskExecute = async (id: string) => {
    try {
      const response = await fetch('/api/tasks/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        const data = await response.json()
        let msg = '任务执行成功'
        if (data.wechatSyncStatus === 'success') {
          msg = '任务执行成功，微信同步完成'
        } else if (data.wechatSyncStatus === 'failed') {
          msg = '任务执行成功，微信同步失败'
        }
        setMessage(msg)
        fetchTasks()
      } else {
        setMessage('任务执行失败，请重试')
      }
    } catch (error) {
      setMessage('任务执行失败，请重试')
    }
  }

  const getOneMinuteLaterCron = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 1)
    const minute = now.getMinutes()
    const hour = now.getHours()
    const day = now.getDate()
    const month = now.getMonth() + 1
    const dayOfWeek = now.getDay()
    return `${minute} ${hour} ${day} ${month} ${dayOfWeek}`
  }

  const handleQuickCreateOneMinute = () => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    
    setNewTask({
      name: `测试任务-${timeStr}`,
      schedule: getOneMinuteLaterCron(),
      status: 'active',
      taskType: 'product-sync'
    })
    setShowTaskForm(true)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold mb-8">内容管理</h1>
      
          {message && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded">
              {message}
            </div>
          )}

          <div className="mb-6 border-b">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-2 px-1 border-b-2 font-medium ${
                  activeTab === 'tasks'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                定时任务
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`py-2 px-1 border-b-2 font-medium ${
                  activeTab === 'system'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                系统说明
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`py-2 px-1 border-b-2 font-medium ${
                  activeTab === 'config'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                配置信息
              </button>
            </nav>
          </div>

          {activeTab === 'tasks' && (
            <div id="tasks-content" className="tab-content">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">定时任务列表</h2>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded font-medium"
              >
                {showTaskForm ? '取消' : '创建任务'}
              </button>
            </div>

            {showTaskForm && (
              <form onSubmit={handleTaskSubmit} className="space-y-4 mb-8 p-6 border rounded-lg">
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
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleQuickCreateOneMinute}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-medium"
                  >
                    1分钟后执行
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded font-medium"
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
                    <th className="border px-4 py-2 text-left">任务类型</th>
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
                      <td colSpan={7} className="border px-4 py-4 text-center">
                        暂无定时任务
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => {
                      const getTaskTypeLabel = (type: string) => {
                        const typeMap: Record<string, string> = {
                          'product-sync': '产品文章同步',
                          'selection-guide-sync': '技术文章同步',
                          'news-generator': '行业动态生成',
                          'content-generator': '内容生成',
                          'custom': '自定义'
                        };
                        return typeMap[type] || typeMap[task.taskType] || type;
                      };
                      
                      const getLastSyncedFile = () => {
                        if (task.metadata?.lastSyncedFile) {
                          return task.metadata.lastSyncedFile;
                        }
                        if (task.lastGeneratedSlug) {
                          return task.lastGeneratedSlug;
                        }
                        return null;
                      };
                      
                      return (
                        <tr key={task.id}>
                          <td className="border px-4 py-2">{task.name}</td>
                          <td className="border px-4 py-2">
                            <span className="text-sm text-gray-600">
                              {getTaskTypeLabel(task.type)}
                            </span>
                          </td>
                          <td className="border px-4 py-2">
                            <code className="text-xs bg-gray-100 px-1 rounded">{task.schedule}</code>
                          </td>
                          <td className="border px-4 py-2">
                            <span className={`px-2 py-1 rounded ${task.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {task.status === 'active' ? '启用' : '禁用'}
                            </span>
                          </td>
                          <td className="border px-4 py-2">
                            <div>
                              <div>{task.lastRun ? new Date(task.lastRun).toLocaleString() : '从未执行'}</div>
                              {getLastSyncedFile() && (
                                <div className="text-xs text-gray-500 mt-1">
                                  文件: {getLastSyncedFile()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="border px-4 py-2">
                            <span className={`px-2 py-1 rounded ${
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
                                onClick={() => handleTaskExecute(task.id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                              >
                                立即执行
                              </button>
                              <button
                                onClick={() => handleTaskDelete(task.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                              >
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Cron表达式详细说明</h3>
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium mb-2">基本格式</h4>
                <p className="mb-4">Cron表达式格式: <code>分 时 日 月 周</code></p>
                
                <h4 className="font-medium mb-2">字段说明</h4>
                <ul className="list-disc pl-5 space-y-1 mb-4">
                  <li><strong>分</strong>: 0-59</li>
                  <li><strong>时</strong>: 0-23</li>
                  <li><strong>日</strong>: 1-31</li>
                  <li><strong>月</strong>: 1-12</li>
                  <li><strong>周</strong>: 0-6 (0表示周日)</li>
                </ul>
                
                <h4 className="font-medium mb-2">特殊字符</h4>
                <ul className="list-disc pl-5 space-y-1 mb-4">
                  <li><code>*</code>: 表示任意值</li>
                  <li><code>/</code>: 表示间隔，如 <code>*/5</code> 表示每5个单位</li>
                  <li><code>-</code>: 表示范围，如 <code>1-5</code> 表示1到5</li>
                  <li><code>,</code>: 表示多个值，如 <code>1,3,5</code> 表示1、3、5</li>
                </ul>
                
                <h4 className="font-medium mb-2">常用示例</h4>
                <ul className="list-disc pl-5 space-y-1 mb-4">
                  <li><code>30 8 * * *</code> - 每天8:30执行</li>
                  <li><code>0 12 * * 1-5</code> - 工作日（周一到周五）12:00执行</li>
                  <li><code>0 0 1 * *</code> - 每月1日0:00执行</li>
                  <li><code>0 0 * * 0</code> - 每周日0:00执行</li>
                  <li><code>*/15 * * * *</code> - 每15分钟执行一次</li>
                  <li><code>0 */2 * * *</code> - 每2小时执行一次</li>
                  <li><code>0 9 1,15 * *</code> - 每月1日和15日9:00执行</li>
                  <li><code>30 10 * * 6,0</code> - 周末（周六、周日）10:30执行</li>
                  <li><code>0 0 31 12 *</code> - 每年12月31日0:00执行</li>
                  <li><code>0 18 * * 5</code> - 每周五18:00执行</li>
                </ul>
                
                <h4 className="font-medium mb-2">测试建议</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>近期测试：设置一个5分钟后执行的任务，如当前时间14:30，设置为 <code>35 14 * * *</code></li>
                  <li>验证执行：创建任务后，点击"立即执行"按钮测试任务是否能正常运行</li>
                  <li>查看日志：执行任务后，查看终端日志确认任务执行情况</li>
                </ul>
              </div>
            </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div id="system-content" className="tab-content">
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4 text-blue-800">🔧 系统架构说明</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-lg mb-2">定时任务模块架构</h3>
                      <p className="text-gray-700 mb-2">
                        定时任务功能已独立封装为 <code className="bg-gray-200 px-1 rounded">cron-task-manager</code> 包，
                        位于项目根目录下。该模块提供完整的任务管理、调度和存储功能。
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-medium mb-3">📁 核心目录结构</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        <li><code className="bg-gray-100 px-1">cron-task-manager/</code> - 独立的定时任务管理包</li>
                        <li><code className="bg-gray-100 px-1">content/news/</code> - 生成的新闻文章存放目录</li>
                        <li><code className="bg-gray-100 px-1">content/tasks/</code> - 定时任务数据存储目录（JSON格式）</li>
                        <li><code className="bg-gray-100 px-1">public/images/news/</code> - 新闻图片目录</li>
                        <li><code className="bg-gray-100 px-1">public/images/news/honeywell/</code> - 产品/技术类图片</li>
                        <li><code className="bg-gray-100 px-1">public/images/news/hvac/</code> - 行业动态类图片</li>
                        <li><code className="bg-gray-100 px-1">scripts/ai-content-generate.js</code> - AI内容生成脚本</li>
                      </ul>
                    </div>

                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-medium mb-3">🔄 任务类型说明</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-green-700">产品文章同步</h4>
                          <p className="text-gray-600 text-sm">从 content/products/ 目录随机选择md文件同步到微信草稿（不重复选择）</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-700">技术文章同步</h4>
                          <p className="text-gray-600 text-sm">从 content/selection-guide/ 目录随机选择md文件同步到微信草稿（不重复选择）</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-700">行业动态生成</h4>
                          <p className="text-gray-600 text-sm">AI生成行业动态文章（仅保留政策法规类、市场报告类、展会活动类），生成后自动同步到微信草稿</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-medium mb-3">📝 文件选择机制</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        <li><strong>随机选择：</strong>每次执行任务从对应目录随机选择一个md文件</li>
                        <li><strong>不重复：</strong>已同步的文件不会再次选择，直到所有文件都同步完</li>
                        <li><strong>循环队列：</strong>所有文件同步完成后，重新随机打乱并开始新一轮</li>
                        <li><strong>动态更新：</strong>目录新增文件会自动插入到队列中</li>
                        <li><strong>队列存储：</strong>队列状态保存在 content/task-queues/ 目录下</li>
                      </ul>
                    </div>

                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-medium mb-3">📄 源文件目录</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        <li><strong>产品文章：</strong><code className="bg-gray-100 px-1">content/products/</code> - Karpathy LLM Wiki生成的产品详情</li>
                        <li><strong>技术文章：</strong><code className="bg-gray-100 px-1">content/selection-guide/</code> - Karpathy LLM Wiki生成的技术文章</li>
                        <li><strong>行业资讯：</strong><code className="bg-gray-100 px-1">content/news/</code> - 行业动态文章（政策/市场/展会）</li>
                      </ul>
                    </div>

                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-medium mb-3">📤 微信同步流程</h3>
                      <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                        <li>从对应目录队列中选择下一个md文件</li>
                        <li>解析Markdown文件，提取Frontmatter和正文</li>
                        <li>转换Markdown为微信兼容的HTML格式</li>
                        <li>上传图片到微信获取media_id</li>
                        <li>调用微信API创建草稿</li>
                        <li>更新任务状态和队列状态</li>
                        <li>记录最后同步的文件名</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div id="config-content" className="tab-content">
              <div className="space-y-6">
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4 text-yellow-800">⚙️ 配置信息</h2>
                  <p className="text-yellow-700 mb-4">
                    以下配置通过环境变量 <code className="bg-yellow-100 px-1 rounded">.env</code> 文件管理，
                    修改后需要重启开发服务器或重新构建项目。
                  </p>

                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-medium mb-3">🌐 网站基础配置</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-3 py-2 text-left">配置项</th>
                              <th className="px-3 py-2 text-left">说明</th>
                              <th className="px-3 py-2 text-left">示例值</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t">
                              <td className="px-3 py-2 font-mono">NEXT_PUBLIC_SITE_URL</td>
                              <td className="px-3 py-2">网站域名</td>
                              <td className="px-3 py-2">http://www.hubeikexinda.online</td>
                            </tr>
                            <tr className="border-t">
                              <td className="px-3 py-2 font-mono">NEXT_PUBLIC_SITE_NAME</td>
                              <td className="px-3 py-2">网站名称</td>
                              <td className="px-3 py-2">湖北科信达机电设备有限公司</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-medium mb-3">🤖 AI内容生成配置</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-3 py-2 text-left">配置项</th>
                              <th className="px-3 py-2 text-left">说明</th>
                              <th className="px-3 py-2 text-left">默认值</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t">
                              <td className="px-3 py-2 font-mono">MOONSHOT_API_KEY</td>
                              <td className="px-3 py-2">月之暗面API Key</td>
                              <td className="px-3 py-2">sk-xxxxxxxx</td>
                            </tr>
                            <tr className="border-t">
                              <td className="px-3 py-2 font-mono">AI_CONTENT_MIN_WORDS</td>
                              <td className="px-3 py-2">文章最少字数</td>
                              <td className="px-3 py-2">1500</td>
                            </tr>
                            <tr className="border-t">
                              <td className="px-3 py-2 font-mono">AI_CONTENT_MAX_WORDS</td>
                              <td className="px-3 py-2">文章最多字数</td>
                              <td className="px-3 py-2">3000</td>
                            </tr>
                            <tr className="border-t">
                              <td className="px-3 py-2 font-mono">AI_KEYWORD_DENSITY_MIN</td>
                              <td className="px-3 py-2">最小关键词密度</td>
                              <td className="px-3 py-2">0.02 (2%)</td>
                            </tr>
                            <tr className="border-t">
                              <td className="px-3 py-2 font-mono">AI_KEYWORD_DENSITY_MAX</td>
                              <td className="px-3 py-2">最大关键词密度</td>
                              <td className="px-3 py-2">0.03 (3%)</td>
                            </tr>
                            <tr className="border-t">
                              <td className="px-3 py-2 font-mono">AI_MAX_RETRIES</td>
                              <td className="px-3 py-2">API最大重试次数</td>
                              <td className="px-3 py-2">3</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-medium mb-3">💬 微信服务号配置</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-3 py-2 text-left">配置项</th>
                              <th className="px-3 py-2 text-left">说明</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t">
                              <td className="px-3 py-2 font-mono">WECHAT_APPID</td>
                              <td className="px-3 py-2">微信服务号AppID</td>
                            </tr>
                            <tr className="border-t">
                              <td className="px-3 py-2 font-mono">WECHAT_APPSECRET</td>
                              <td className="px-3 py-2">微信服务号AppSecret</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-medium mb-3">📂 目录配置（硬编码）</h3>
                      <p className="text-gray-600 text-sm mb-3">以下目录路径在代码中硬编码，如需修改请编辑对应文件：</p>
                      <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>
                          <strong>内容生成目录：</strong>
                          <code className="bg-gray-100 px-1">content/news/</code>
                          <span className="text-sm text-gray-500 ml-2">在 scripts/ai-content-generate.js 第25行</span>
                        </li>
                        <li>
                          <strong>任务数据存储：</strong>
                          <code className="bg-gray-100 px-1">content/tasks/</code>
                          <span className="text-sm text-gray-500 ml-2">在 cron-task-manager/src/storage/FileStorage.ts 中配置</span>
                        </li>
                        <li>
                          <strong>新闻图片目录：</strong>
                          <code className="bg-gray-100 px-1">public/images/news/</code>
                          <span className="text-sm text-gray-500 ml-2">在 scripts/ai-content-generate.js 第31行</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-medium mb-3">🔑 关键词来源</h3>
                      <p className="text-gray-600 text-sm mb-3">关键词在 scripts/ai-content-generate.js 中定义：</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-blue-700 mb-1">行业动态关键词</h4>
                          <p className="text-sm text-gray-600">武汉中央空调阀门、湖北暖通工程、武汉楼宇自控、湖北节能改造、武汉暖通市场、湖北中央空调、武汉阀门市场、湖北暖通行业</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-purple-700 mb-1">技术知识库关键词</h4>
                          <p className="text-sm text-gray-600">霍尼韦尔电动阀门、霍尼韦尔平衡阀、霍尼韦尔调节阀、霍尼韦尔温控阀、霍尼韦尔电动二通阀、霍尼韦尔电动球阀、霍尼韦尔电动蝶阀、阀门选型指南、暖通系统维护、楼宇自控技术</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <Link href="/" className="text-cta hover:underline">
              返回首页
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
