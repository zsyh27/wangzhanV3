import { NextRequest, NextResponse } from 'next/server';
import { taskManager } from '@/lib/task-manager.js';

export async function POST(request) {
  try {
    const data = await request.json();
    const { id } = data;

    const tasks = await taskManager.getAllTasks();
    const task = tasks.find(t => t.id === id);

    if (!task) {
      return NextResponse.json({ success: false, error: '任务不存在' }, { status: 404 });
    }

    const syncTypes = ['product-sync', 'selection-guide-sync', 'news-sync'];
    const isSyncTask = syncTypes.includes(task.type) || syncTypes.includes(task.taskType);

    let result;
    
    if (isSyncTask) {
      result = await taskManager.executeWechatSyncTask(task);
    } else {
      result = await taskManager.executeContentGeneratorTask(task);
    }

    if (result.success) {
      const updates = {
        lastRun: new Date().toISOString(),
        wechatSyncStatus: result.wechatSyncStatus,
        wechatMediaId: result.wechatMediaId
      };

      if (result.slug) {
        updates.lastGeneratedSlug = result.slug;
      }

      if (result.fileName) {
        updates.metadata = {
          ...(task.metadata || {}),
          lastSyncedFile: result.fileName
        };
      }

      await taskManager.updateTask(id, updates);

      return NextResponse.json({ 
        success: true, 
        wechatSyncStatus: result.wechatSyncStatus,
        wechatMediaId: result.wechatMediaId,
        message: result.message
      });
    } else {
      await taskManager.updateTask(id, {
        lastRun: new Date().toISOString(),
        wechatSyncStatus: 'failed'
      });
      return NextResponse.json({ success: false, error: result.error || '任务执行失败' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: '任务执行失败' }, { status: 500 });
  }
}
