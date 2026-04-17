const fs = require('fs')
const path = require('path')

const RAW_DIR = path.join(__dirname, '..', 'raw')

async function reorganizeRaw() {
  console.log('=== 重组 raw 目录 ===\n')

  const subdirs = ['honeywell', 'technical']
  
  for (const subdir of subdirs) {
    const subdirPath = path.join(RAW_DIR, subdir)
    
    if (fs.existsSync(subdirPath)) {
      const files = fs.readdirSync(subdirPath)
      
      for (const file of files) {
        const srcPath = path.join(subdirPath, file)
        const destPath = path.join(RAW_DIR, file)
        
        if (fs.statSync(srcPath).isFile()) {
          fs.renameSync(srcPath, destPath)
          console.log(`移动: ${subdir}/${file} -> ${file}`)
        }
      }
      
      try {
        fs.rmdirSync(subdirPath)
        console.log(`删除空目录: ${subdir}/`)
      } catch (e) {
        console.log(`无法删除目录 ${subdir}/: ${e.message}`)
      }
    }
  }

  console.log('\n完成！raw 目录现在不区分类别。')
}

if (require.main === module) {
  reorganizeRaw()
}
