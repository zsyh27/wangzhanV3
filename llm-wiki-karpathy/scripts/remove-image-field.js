const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const WIKI_PRODUCTS_DIR = path.join(__dirname, '../wiki/products')

function removeImageField() {
  const files = fs.readdirSync(WIKI_PRODUCTS_DIR).filter(f => f.endsWith('.md'))
  let updatedCount = 0

  console.log('开始移除 image 字段...\n')

  for (const file of files) {
    const filePath = path.join(WIKI_PRODUCTS_DIR, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const { data, content: mdContent } = matter(content)

    if (data.image) {
      delete data.image
      const newContent = matter.stringify(mdContent, data)
      fs.writeFileSync(filePath, newContent)
      console.log(`✅ 移除 ${file} 的 image 字段`)
      updatedCount++
    } else {
      console.log(`⏭️  ${file} 没有 image 字段，跳过`)
    }
  }

  console.log(`\n完成！共更新 ${updatedCount} 个文件`)
}

removeImageField()
