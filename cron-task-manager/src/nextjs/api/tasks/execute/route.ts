import { NextRequest, NextResponse } from 'next/server';
import { TaskManager, FileStorage } from '../../../../core';

// 初始化存储和任务管理器
const storage = new FileStorage({ path: './data/tasks' });
const taskManager = new TaskManager({ storage });

/**
 * POST /api/tasks/execute
 * 立即执行指定任务
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少任务ID' },
        { status: 400 }
      );
    }

    // 执行任务
    const result = await taskManager.executeTask(id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '任务执行成功',
        wechatSyncStatus: result.wechatSyncStatus,
        wechatMediaId: result.wechatMediaId,
        slug: result.slug
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || '任务执行失败',
          wechatSyncStatus: result.wechatSyncStatus
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '任务执行失败';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
