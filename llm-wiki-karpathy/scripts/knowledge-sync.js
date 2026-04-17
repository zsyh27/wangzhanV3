const fs = require('fs')
const path = require('path')

const WIKI_DIR = path.join(__dirname, '..', 'wiki')
const CONTENT_DIR = path.join(__dirname, '..', '..', 'content')

const SYNC_MAP = {
  'entities': 'products',
  'topics': 'selection-guide',
  'comparisons': 'selection-guide',
  'synthesis': 'selection-guide'
}

function stripWikiLinks(content) {
  return content.replace(/\[\[([^\]]+)\]\]/g, '$1')
}

function normalizeFilename(filename) {
  let name = filename.replace('.md', '')
  name = name.replace(/系列/g, '')
  name = name.replace(/\.\./g, '')
  return name.toLowerCase() + '.md'
}

function syncDirectory(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    console.log(`源目录不存在，跳过: ${sourceDir}`)
    return 0
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
    console.log(`创建目标目录: ${targetDir}`)
  }

  const files = fs.readdirSync(sourceDir)
  let syncedCount = 0

  files.forEach(file => {
    if (file.startsWith('.') || !file.endsWith('.md')) {
      return
    }

    const sourcePath = path.join(sourceDir, file)
    const targetFilename = normalizeFilename(file)
    const targetPath = path.join(targetDir, targetFilename)

    const sourceStat = fs.statSync(sourcePath)
    let needSync = true

    if (fs.existsSync(targetPath)) {
      const targetStat = fs.statSync(targetPath)
      needSync = sourceStat.mtime > targetStat.mtime
    }

    if (needSync) {
      const content = fs.readFileSync(sourcePath, 'utf8')
      const processedContent = stripWikiLinks(content)
      fs.writeFileSync(targetPath, processedContent, 'utf8')
      console.log(`  [同步] ${file} -> ${targetFilename}`)
      syncedCount++
    } else {
      console.log(`  [跳过] ${file} (未变更)`)
    }
  })

  return syncedCount
}

function main() {
  console.log('=== LLM Wiki 知识同步脚本 ===\n')
  console.log(`Wiki 目录: ${WIKI_DIR}`)
  console.log(`Content 目录: ${CONTENT_DIR}\n`)

  let totalSynced = 0

  Object.entries(SYNC_MAP).forEach(([wikiSubdir, contentSubdir]) => {
    const sourceDir = path.join(WIKI_DIR, wikiSubdir)
    const targetDir = path.join(CONTENT_DIR, contentSubdir)

    console.log(`\n同步 ${wikiSubdir} -> ${contentSubdir}:`)
    console.log('─'.repeat(50))

    const count = syncDirectory(sourceDir, targetDir)
    totalSynced += count
  })

  console.log('\n' + '═'.repeat(50))
  console.log(`同步完成！共同步 ${totalSynced} 个文件`)
}

if (require.main === module) {
  main()
}

module.exports = {
  syncDirectory,
  main
}
