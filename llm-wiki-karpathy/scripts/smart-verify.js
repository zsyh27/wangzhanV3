const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const WIKI_DIR = path.join(__dirname, '../wiki')
const VERIFY_CONFIG_DIR = path.join(__dirname, '../verify-config')

function checkFileExists(slug, dir) {
  const filePath = path.join(dir, `${slug}.md`)
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(content)
      return {
        exists: true,
        title: data.title,
        status: data.status,
        author: data.author,
        path: filePath
      }
    } catch (e) {
      return { exists: true, error: e.message, path: filePath }
    }
  }
  return { exists: false }
}

function verifyDirectory(dirName, displayName) {
  const dir = path.join(WIKI_DIR, dirName)
  
  if (!fs.existsSync(dir)) {
    console.log(`\n⚠️  目录不存在: ${dirName}`)
    return { total: 0, success: 0, missing: 0, errors: 0 }
  }
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'))
  
  console.log(`\n=== ${displayName} ===`)
  console.log(`📂 目录: ${dirName}`)
  console.log(`📝 文件数: ${files.length}\n`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const file of files) {
    const slug = path.basename(file, '.md')
    const result = checkFileExists(slug, dir)
    
    if (result.error) {
      errorCount++
      console.log(`⚠️  [错误] ${file}: ${result.error}`)
    } else {
      successCount++
      const status = result.status === 'published' ? '✅' : '⚠️'
      console.log(`${status} [${result.status}] ${file} - ${result.title}`)
    }
  }
  
  console.log('\n' + '-'.repeat(60))
  console.log(`总计: ${files.length} 项`)
  console.log(`✅ 正常: ${successCount}`)
  console.log(`⚠️  错误: ${errorCount}`)
  
  return { total: files.length, success: successCount, missing: 0, errors: errorCount }
}

function getWikiDirectories() {
  if (!fs.existsSync(WIKI_DIR)) return []
  
  return fs.readdirSync(WIKI_DIR)
    .filter(f => fs.statSync(path.join(WIKI_DIR, f)).isDirectory())
}

function main() {
  console.log('========================================')
  console.log('   🤖 智能知识库验证工具')
  console.log('========================================')
  console.log('\n📋 工作方式: 自动扫描 wiki/ 下的所有目录')
  console.log('📋 无需配置文件！有文件就验证！\n')
  
  const dirs = getWikiDirectories()
  
  if (dirs.length === 0) {
    console.log('❌ 未找到 wiki 子目录')
    process.exit(1)
  }
  
  console.log(`📂 发现 ${dirs.length} 个目录: ${dirs.join(', ')}\n`)
  
  let totalItems = 0
  let totalSuccess = 0
  let totalErrors = 0
  
  const dirNames = {
    'products': '产品页面',
    'selection-guide': '技术文章',
    'industry-news': '行业动态',
    'solutions': '行业方案'
  }
  
  for (const dir of dirs) {
    const displayName = dirNames[dir] || dir
    const result = verifyDirectory(dir, displayName)
    totalItems += result.total
    totalSuccess += result.success
    totalErrors += result.errors
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('汇总统计:')
  console.log(`📊 总计检查: ${totalItems} 项`)
  console.log(`✅ 正常: ${totalSuccess}`)
  console.log(`⚠️  错误: ${totalErrors}`)
  console.log('='.repeat(60))
  
  if (totalErrors > 0) {
    console.log('\n⚠️  发现错误，请检查！')
    process.exit(1)
  } else {
    console.log('\n✅ 所有验证通过！')
    process.exit(0)
  }
}

main()
