const fs = require('fs')
const path = require('path')

const WIKI_DIR = path.join(__dirname, '..', 'wiki')

const replacements = [
  { from: '027-82221533', to: '13907117179' },
  { from: '湖北科信达技术部', to: '湖北科信达机电设备有限公司技术部' }
]

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let updated = false

  replacements.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.split(from).join(to)
      updated = true
      console.log(`  替换: "${from}" → "${to}"`)
    }
  })

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8')
    return true
  }
  return false
}

function updateDirectory(dir) {
  const files = fs.readdirSync(dir)
  let updatedCount = 0

  files.forEach(file => {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isFile() && file.endsWith('.md')) {
      console.log(`\n处理: ${file}`)
      if (updateFile(filePath)) {
        updatedCount++
      }
    }
  })

  return updatedCount
}

async function main() {
  console.log('=== 更新联系信息 ===\n')

  const productsDir = path.join(WIKI_DIR, 'products')
  const selectionGuideDir = path.join(WIKI_DIR, 'selection-guide')

  let totalUpdated = 0

  console.log('更新 products 目录:')
  console.log('─'.repeat(50))
  totalUpdated += updateDirectory(productsDir)

  console.log('\n更新 selection-guide 目录:')
  console.log('─'.repeat(50))
  totalUpdated += updateDirectory(selectionGuideDir)

  console.log('\n' + '═'.repeat(50))
  console.log(`完成！共更新 ${totalUpdated} 个文件`)
}

if (require.main === module) {
  main()
}
