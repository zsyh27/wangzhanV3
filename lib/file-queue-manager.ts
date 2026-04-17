import fs from 'fs';
import path from 'path';

interface QueueState {
  directory: string;
  allFiles: string[];
  pendingFiles: string[];
  completedFiles: string[];
}

const QUEUE_STORAGE_DIR = path.join(process.cwd(), 'content', 'task-queues');

if (!fs.existsSync(QUEUE_STORAGE_DIR)) {
  fs.mkdirSync(QUEUE_STORAGE_DIR, { recursive: true });
}

function getQueueFilePath(directory: string): string {
  const safeName = directory.replace(/[^a-zA-Z0-9]/g, '_');
  return path.join(QUEUE_STORAGE_DIR, `${safeName}.json`);
}

function getFilesFromDirectory(directory: string): string[] {
  const fullPath = path.join(process.cwd(), directory);
  
  if (!fs.existsSync(fullPath)) {
    return [];
  }
  
  return fs.readdirSync(fullPath)
    .filter(file => file.endsWith('.md'))
    .sort((a, b) => {
      const statA = fs.statSync(path.join(fullPath, a));
      const statB = fs.statSync(path.join(fullPath, b));
      return statB.mtime.getTime() - statA.mtime.getTime();
    });
}

function loadQueueState(directory: string): QueueState {
  const queueFilePath = getQueueFilePath(directory);
  
  if (fs.existsSync(queueFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(queueFilePath, 'utf-8'));
      return data as QueueState;
    } catch {
    }
  }
  
  const allFiles = getFilesFromDirectory(directory);
  
  return {
    directory,
    allFiles,
    pendingFiles: [...allFiles],
    completedFiles: []
  };
}

function saveQueueState(state: QueueState): void {
  const queueFilePath = getQueueFilePath(state.directory);
  fs.writeFileSync(queueFilePath, JSON.stringify(state, null, 2));
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getNextFile(directory: string): string | null {
  let state = loadQueueState(directory);
  
  const currentFiles = getFilesFromDirectory(directory);
  
  const newFiles = currentFiles.filter(file => !state.allFiles.includes(file));
  
  if (newFiles.length > 0) {
    state.allFiles = currentFiles;
    state.pendingFiles = [...state.pendingFiles, ...newFiles];
    state.pendingFiles = state.pendingFiles.filter(file => currentFiles.includes(file));
    state.completedFiles = state.completedFiles.filter(file => currentFiles.includes(file));
  }
  
  if (state.pendingFiles.length === 0) {
    if (state.completedFiles.length > 0) {
      state.pendingFiles = shuffleArray([...state.completedFiles]);
      state.completedFiles = [];
    } else {
      saveQueueState(state);
      return null;
    }
  }
  
  if (state.pendingFiles.length > 0 && !isShuffled(state.pendingFiles)) {
    state.pendingFiles = shuffleArray(state.pendingFiles);
  }
  
  const nextFile = state.pendingFiles.shift();
  
  if (nextFile) {
    state.completedFiles.push(nextFile);
  }
  
  saveQueueState(state);
  
  return nextFile || null;
}

function isShuffled(array: string[]): boolean {
  if (array.length <= 1) return true;
  const sorted = [...array].sort();
  return JSON.stringify(array) !== JSON.stringify(sorted);
}

export function resetQueue(directory: string): void {
  const allFiles = getFilesFromDirectory(directory);
  const state: QueueState = {
    directory,
    allFiles,
    pendingFiles: shuffleArray([...allFiles]),
    completedFiles: []
  };
  saveQueueState(state);
}

export function getQueueStatus(directory: string): {
  total: number;
  pending: number;
  completed: number;
  pendingFiles: string[];
  completedFiles: string[];
} {
  const state = loadQueueState(directory);
  return {
    total: state.allFiles.length,
    pending: state.pendingFiles.length,
    completed: state.completedFiles.length,
    pendingFiles: state.pendingFiles,
    completedFiles: state.completedFiles
  };
}
