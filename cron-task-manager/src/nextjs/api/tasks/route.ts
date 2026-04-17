import { NextRequest, NextResponse } from 'next/server';
import { TaskManager, FileStorage } from '../../../core';
import type { CreateTaskDTO, UpdateTaskDTO } from '../../../core';

// 初始化存储和任务管理器
const storage = new FileStorage({ path: './data/tasks' });
const taskManager = new TaskManager({ storage });

/**
 * GET /api/tasks
 * 获取所有任务列表
 */
export async function GET(request: NextRequest) {
  try {
    const tasks = await taskManager.getAllTasks();
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取任务列表失败';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * 创建新任务
 */
export async function POST(request: NextRequest) {
  try {
    const data: CreateTaskDTO = await request.json();
    
    // 验证必填字段
    if (!data.name || !data.schedule) {
      return NextResponse.json(
        { success: false, error: '任务名称和执行计划不能为空' },
        { status: 400 }
      );
    }

    const task = await taskManager.createTask(data);
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '创建任务失败';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tasks
 * 更新任务
 */
export async function PUT(request: NextRequest) {
  try {
    const data: UpdateTaskDTO & { id: string } = await request.json();
    const { id, ...updates } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少任务ID' },
        { status: 400 }
      );
    }

    const task = await taskManager.updateTask(id, updates);
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '更新任务失败';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks?id=xxx
 * 删除任务
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少任务ID' },
        { status: 400 }
      );
    }

    const result = await taskManager.deleteTask(id);
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '删除任务失败';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
