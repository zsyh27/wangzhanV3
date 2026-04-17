const fs = require('fs')
const path = require('path')

const RAW_DIR = path.join(__dirname, '../raw')
const IMAGES_DIR = path.join(__dirname, '../../public/images/products')

async function main() {
  console.log('=== PDF 图片提取工具 ===\n')
  console.log('⚠️  注意：PDF 图片提取需要浏览器环境或额外的依赖')
  console.log('📋  建议方案：')
  console.log('   1. 手动从 PDF 中截图保存')
  console.log('   2. 使用 Adobe Acrobat 导出图片')
  console.log('   3. 使用在线 PDF 转图片工具')
  console.log('\n📂 图片保存目录：', IMAGES_DIR)
  
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true })
    console.log('\n✅ 已创建图片目录')
  }
  
  console.log('\n💡 提示：手动添加图片后，文件名格式建议：')
  console.log('   - 产品型号.png (如: v5011b2w.png)')
  console.log('   - 产品型号-1.png, 产品型号-2.png (多图)')
  console.log('\n✅ 准备就绪！')
}

main().catch(err => {
  console.error('错误:', err)
  process.exit(1)
})
