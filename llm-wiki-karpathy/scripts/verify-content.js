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

function verifyConfig(configPath) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  const dir = path.join(WIKI_DIR, config.directory)
  
  console.log(`\n=== ${config.name} ===\n`)
  console.log(`📂 目录: ${config.directory}`)
  console.log(`📝 说明: ${config.description}\n`)
  
  const results = []
  let missingCount = 0
  let errorCount = 0
  let successCount = 0
  
  for (const item of config.items) {
    const result = checkFileExists(item.slug, dir)
    
    results.push({
      ...item,
      ...result
    })
    
    if (!result.exists) {
      missingCount++
      console.log(`❌ [缺失] ${item.name}`)
    } else if (result.error) {
      errorCount++
      console.log(`⚠️  [错误] ${item.name}: ${result.error}`)
    } else {
      successCount++
      const status = result.status === 'published' ? '✅' : '⚠️'
      const category = item.category ? ` [${item.category}]` : ''
      console.log(`${status} [${result.status}]${category} ${item.name} - ${result.title}`)
    }
  }
  
  console.log('\n' + '-'.repeat(60))
  console.log(`总计: ${config.items.length} 项`)
  console.log(`✅ 成功: ${successCount}`)
  console.log(`⚠️  待发布: ${config.items.length - successCount - missingCount - errorCount}`)
  console.log(`❌ 缺失: ${missingCount}`)
  console.log(`⚠️  错误: ${errorCount}`)
  
  return { results, missingCount, errorCount, successCount, totalCount: config.items.length }
}

function main() {
  console.log('========================================')
  console.log('   知识库内容自动验证工具')
  console.log('========================================')
  
  if (!fs.existsSync(VERIFY_CONFIG_DIR)) {
    console.log('\n❌ 验证配置目录不存在:', VERIFY_CONFIG_DIR)
    process.exit(1)
  }
  
  const configFiles = fs.readdirSync(VERIFY_CONFIG_DIR)
    .filter(f => f.endsWith('.json'))
  
  if (configFiles.length === 0) {
    console.log('\n❌ 未找到验证配置文件')
    process.exit(1)
  }
  
  let totalMissing = 0
  let totalErrors = 0
  let totalSuccess = 0
  let totalItems = 0
  
  for (const configFile of configFiles) {
    const configPath = path.join(VERIFY_CONFIG_DIR, configFile)
    const result = verifyConfig(configPath)
    totalMissing += result.missingCount
    totalErrors += result.errorCount
    totalSuccess += result.successCount
    totalItems += result.totalCount
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('汇总统计:')
  console.log(`📊 总计检查: ${totalItems} 项`)
  console.log(`✅ 成功: ${totalSuccess}`)
  console.log(`⚠️  待发布: ${totalItems - totalSuccess - totalMissing - totalErrors}`)
  console.log(`❌ 缺失: ${totalMissing}`)
  console.log(`⚠️  错误: ${totalErrors}`)
  console.log('='.repeat(60))
  
  if (totalMissing > 0 || totalErrors > 0) {
    console.log('\n⚠️  发现问题，请检查！')
    process.exit(1)
  } else {
    console.log('\n✅ 所有验证通过！')
    process.exit(0)
  }
}

main()
