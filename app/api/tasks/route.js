import { NextRequest, NextResponse } from 'next/server';
import { taskManager } from '@/lib/task-manager.js';

export async function GET(request) {
  try {
    const tasks = await taskManager.getAllTasks();
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    return NextResponse.json({ success: false, error: '获取任务列表失败' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const task = await taskManager.createTask(data);
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ success: false, error: '创建任务失败' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;
    const task = await taskManager.updateTask(id, updates);
    if (!task) {
      return NextResponse.json({ success: false, error: '任务不存在' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ success: false, error: '更新任务失败' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少任务ID' }, { status: 400 });
    }
    const result = await taskManager.deleteTask(id);
    if (!result) {
      return NextResponse.json({ success: false, error: '任务不存在' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: '删除任务失败' }, { status: 500 });
  }
}
