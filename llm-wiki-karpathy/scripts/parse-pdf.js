const fs = require('fs')
const path = require('path')
const pdfParse = require('pdf-parse')

const PDF_PATH = path.join(__dirname, '..', 'raw', '霍尼韦尔暖通空调电动阀与执行器综合样册-2025.pdf')
const OUTPUT_PATH = path.join(__dirname, '..', 'raw', 'parsed-pdf-content.txt')

async function parsePDF() {
  console.log('=== 霍尼韦尔 PDF 解析工具 ===\n')
  console.log(`正在解析: ${PDF_PATH}`)

  try {
    const dataBuffer = fs.readFileSync(PDF_PATH)
    const data = await pdfParse(dataBuffer)

    console.log(`\n✅ PDF 解析成功!`)
    console.log(`   页数: ${data.numpages}`)
    console.log(`   文本长度: ${data.text.length} 字符\n`)

    fs.writeFileSync(OUTPUT_PATH, data.text, 'utf8')
    console.log(`解析内容已保存到: ${OUTPUT_PATH}`)

    console.log('\n' + '═'.repeat(60))
    console.log('前 3000 个字符预览:')
    console.log('─'.repeat(60))
    console.log(data.text.substring(0, 3000))
    console.log('...\n')

    return data.text

  } catch (error) {
    console.error('❌ PDF 解析失败:', error.message)
    throw error
  }
}

if (require.main === module) {
  parsePDF()
}

module.exports = {
  parsePDF
}
