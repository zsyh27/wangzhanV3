// Next.js集成层导出
export { default as TaskAdminPage } from './pages/admin/tasks/page';

// API路由处理器
export { GET as tasksGET, POST as tasksPOST, PUT as tasksPUT, DELETE as tasksDELETE } from './api/tasks/route';
export { POST as executePOST } from './api/tasks/execute/route';
