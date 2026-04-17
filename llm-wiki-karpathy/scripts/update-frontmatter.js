const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const WIKI_PRODUCTS_DIR = path.join(__dirname, '../wiki/products')

const productInfo = {
  'v5011b2w': { model: 'V5011B2W', brand: '霍尼韦尔', category: '电动座阀' },
  'v5011b3w': { model: 'V5011B3W', brand: '霍尼韦尔', category: '电动座阀' },
  'v5011s2w': { model: 'V5011S2W', brand: '霍尼韦尔', category: '电动座阀' },
  'v5011s3w': { model: 'V5011S3W', brand: '霍尼韦尔', category: '电动座阀' },
  'v5gv2w': { model: 'V5GV2W', brand: '霍尼韦尔', category: '电动座阀' },
  'v5gv3w': { model: 'V5GV3W', brand: '霍尼韦尔', category: '电动座阀' },
  'v6gv': { model: 'V6GV', brand: '霍尼韦尔', category: '电动座阀' },
  'vh58': { model: 'VH58', brand: '霍尼韦尔', category: '电动座阀' },
  'v5011s2s': { model: 'V5011S2S', brand: '霍尼韦尔', category: '电动座阀' },
  'v5gv2s': { model: 'V5GV2S', brand: '霍尼韦尔', category: '电动座阀' },
  'ml74': { model: 'ML74', brand: '霍尼韦尔', category: '执行器' },
  'ml8824': { model: 'ML8824', brand: '霍尼韦尔', category: '执行器' },
  'ml8624': { model: 'ML8624', brand: '霍尼韦尔', category: '执行器' },
  'vba16p': { model: 'VBA16P', brand: '霍尼韦尔', category: '电动球阀' },
  'vba16pe': { model: 'VBA16P..E', brand: '霍尼韦尔', category: '电动球阀' },
  'vbf16e-vbh16e': { model: 'VBF16..E/VBH16..E', brand: '霍尼韦尔', category: '电动球阀' },
  'vba16f': { model: 'VBA16F', brand: '霍尼韦尔', category: '电动球阀' },
  'mvn': { model: 'MVN', brand: '霍尼韦尔', category: '执行器' },
  'v9bf': { model: 'V9BF', brand: '霍尼韦尔', category: '电动蝶阀' },
  'v9bfw25': { model: 'V9BFW25', brand: '霍尼韦尔', category: '电动蝶阀' },
  'v8bfs': { model: 'V8BF..S', brand: '霍尼韦尔', category: '电动蝶阀' },
  'nom': { model: 'NOM', brand: '霍尼韦尔', category: '执行器' }
}

function updateFrontmatter() {
  const files = fs.readdirSync(WIKI_PRODUCTS_DIR).filter(f => f.endsWith('.md'))
  let updatedCount = 0

  console.log('开始更新 Frontmatter...\n')

  for (const file of files) {
    const slug = path.basename(file, '.md')
    const info = productInfo[slug]

    if (!info) {
      console.log(`⚠️  未找到 ${slug} 的信息，跳过`)
      continue
    }

    const filePath = path.join(WIKI_PRODUCTS_DIR, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const { data, content: mdContent } = matter(content)

    const newData = {
      ...data,
      model: info.model,
      brand: info.brand,
      category: info.category
    }

    const newContent = matter.stringify(mdContent, newData)
    fs.writeFileSync(filePath, newContent)

    console.log(`✅ 更新 ${file}: model=${info.model}, category=${info.category}`)
    updatedCount++
  }

  console.log(`\n完成！共更新 ${updatedCount} 个文件`)
}

updateFrontmatter()
