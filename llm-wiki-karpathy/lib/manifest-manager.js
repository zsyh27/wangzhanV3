const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const ROOT_DIR = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT_DIR, 'manifests', 'raw-sources.csv');
const RAW_DIR = path.join(ROOT_DIR, 'raw');

/**
 * 计算文件的 MD5 校验和
 * @param {string} filePath - 文件路径
 * @returns {Promise<string>} MD5 哈希值
 */
async function calculateMD5(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fsSync.createReadStream(filePath);
    
    stream.on('error', reject);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

/**
 * 根据文件扩展名检测素材类型
 * @param {string} filename - 文件名
 * @returns {string} 素材类型
 */
function detectType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const dir = path.dirname(filename);
  
  if (dir.includes('pdfs') || ext === '.pdf') return 'pdf';
  if (dir.includes('articles') || ext === '.md') return 'article';
  if (dir.includes('wechat')) return 'wechat';
  if (dir.includes('notes')) return 'note';
  
  return 'unknown';
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期
 */
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 读取 manifests 清单
 * @returns {Promise<Array>} 素材清单
 */
async function readManifest() {
  return new Promise((resolve, reject) => {
    const results = [];
    
    if (!fsSync.existsSync(MANIFEST_PATH)) {
      resolve([]);
      return;
    }
    
    fsSync.createReadStream(MANIFEST_PATH)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

/**
 * 写入 manifests 清单
 * @param {Array} manifest - 素材清单
 */
async function writeManifest(manifest) {
  const csvWriter = createCsvWriter({
    path: MANIFEST_PATH,
    header: [
      { id: 'filename', title: 'filename' },
      { id: 'type', title: 'type' },
      { id: 'date_added', title: 'date_added' },
      { id: 'date_modified', title: 'date_modified' },
      { id: 'processed_date', title: 'processed_date' },
      { id: 'status', title: 'status' },
      { id: 'version', title: 'version' },
      { id: 'check_sum', title: 'check_sum' },
      { id: 'wiki_pages', title: 'wiki_pages' }
    ],
    quoteAll: true
  });
  
  await csvWriter.writeRecords(manifest);
}

/**
 * 查找素材
 * @param {Array} manifest - 素材清单
 * @param {string} filename - 文件名
 * @returns {Object|null} 素材条目
 */
function findSource(manifest, filename) {
  return manifest.find(item => item.filename === filename) || null;
}

/**
 * 添加新素材
 * @param {Array} manifest - 素材清单
 * @param {Object} source - 素材信息
 * @returns {Array} 更新后的清单
 */
function addSource(manifest, source) {
  const now = formatDate(new Date());
  const newSource = {
    filename: source.filename,
    type: source.type || detectType(source.filename),
    date_added: now,
    date_modified: source.date_modified || now,
    processed_date: null,
    status: 'pending',
    version: null,
    check_sum: source.check_sum || '',
    wiki_pages: ''
  };
  
  manifest.push(newSource);
  return manifest;
}

/**
 * 更新素材
 * @param {Array} manifest - 素材清单
 * @param {string} filename - 文件名
 * @param {Object} updates - 更新字段
 * @returns {Array} 更新后的清单
 */
function updateSource(manifest, filename, updates) {
  const index = manifest.findIndex(item => item.filename === filename);
  if (index !== -1) {
    manifest[index] = { ...manifest[index], ...updates };
  }
  return manifest;
}

/**
 * 更新素材状态
 * @param {Array} manifest - 素材清单
 * @param {string} filename - 文件名
 * @param {string} status - 新状态
 * @param {Array} wikiPages - 生成的 wiki 页面（可选）
 * @returns {Array} 更新后的清单
 */
function updateManifestStatus(manifest, filename, status, wikiPages = null) {
  const updates = { status };
  
  if (status === 'processed') {
    updates.processed_date = formatDate(new Date());
    updates.version = manifest.find(item => item.filename === filename)?.version || '1.0';
    if (wikiPages) {
      updates.wiki_pages = Array.isArray(wikiPages) ? wikiPages.join(',') : wikiPages;
    }
  }
  
  return updateSource(manifest, filename, updates);
}

/**
 * 扫描 raw/ 目录获取所有素材
 * @param {string} dir - 目录路径
 * @param {string} [baseDir] - 基础目录（用于相对路径）
 * @returns {Promise<Array>} 素材文件列表
 */
async function scanRawDirectory(dir = RAW_DIR, baseDir = '') {
  const files = [];
  
  async function scan(currentDir, relativePath) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        await scan(fullPath, relPath);
      } else if (entry.isFile()) {
        const stats = await fs.stat(fullPath);
        files.push({
          path: fullPath,
          name: relPath.replace(/\\/g, '/'),
          mtime: formatDate(stats.mtime)
        });
      }
    }
  }
  
  await scan(dir, baseDir);
  return files;
}

/**
 * 自增版本号
 * @param {string|null} version - 当前版本号
 * @returns {string} 新的版本号
 */
function incrementVersion(version) {
  if (!version) return '1.0';
  
  const match = version.match(/^(\d+)\.(\d+)$/);
  if (match) {
    const major = parseInt(match[1]);
    const minor = parseInt(match[2]) + 1;
    return `${major}.${minor}`;
  }
  
  return version;
}

module.exports = {
  calculateMD5,
  detectType,
  formatDate,
  readManifest,
  writeManifest,
  findSource,
  addSource,
  updateSource,
  updateManifestStatus,
  scanRawDirectory,
  incrementVersion,
  MANIFEST_PATH,
  RAW_DIR
};
