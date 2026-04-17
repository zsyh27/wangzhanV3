const http = require('http')
const fs = require('fs')
const path = require('path')
const { getSiteConfig, getBaiduPushConfig } = require('../lib/config')

/**
 * 百度主动推送脚本
 * SEO优化：对接百度搜索资源平台普通收录API
 * 配置读取：从环境变量读取，避免配置不一致
 */
const { siteUrl: BASE_URL } = getSiteConfig()
const { apiUrl: BAIDU_PUSH_API } = getBaiduPushConfig()
const CONTENT_DIRS = ['products', 'solutions', 'cases', 'news']

function getMdFiles(dir) {
  const fullPath = path.join(process.cwd(), 'content', dir)
  if (!fs.existsSync(fullPath)) return []
  return fs.readdirSync(fullPath)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''))
}

function pushSingleUrl(url) {
  return pushUrls([url])
}

function pushUrls(urls) {
  return new Promise((resolve, reject) => {
    const postData = urls.join('\n')
    
    const url = new URL(BAIDU_PUSH_API)
    const options = {
      hostname: url.hostname,
      port: 80,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': Buffer.byteLength(postData),
      },
    }

    const req = http.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          console.log('百度推送结果:', result)
          resolve(result)
        } catch (error) {
          console.error('解析百度推送结果失败:', error)
          reject(error)
        }
      })
    })

    req.on('error', (error) => {
      console.error('百度推送请求失败:', error)
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

function getAllUrls() {
  const fixedPages = [
    `${BASE_URL}/`,
    `${BASE_URL}/about`,
    `${BASE_URL}/products`,
    `${BASE_URL}/solutions`,
    `${BASE_URL}/cases`,
    `${BASE_URL}/news`,
    `${BASE_URL}/contact`,
  ]

  const allUrls = [...fixedPages]

  CONTENT_DIRS.forEach(dir => {
    const slugs = getMdFiles(dir)
    slugs.forEach(slug => {
      allUrls.push(`${BASE_URL}/${dir}/${slug}`)
    })
  })

  return allUrls
}

async function main() {
  const args = process.argv.slice(2)
  const singleUrl = args[0]

  console.log('=== 百度URL主动推送脚本 ===')
  console.log(`站点URL: ${BASE_URL}\n`)

  if (singleUrl) {
    console.log('模式：单条URL推送')
    console.log(`URL: ${singleUrl}\n`)

    try {
      const result = await pushSingleUrl(singleUrl)
      console.log('\n=== 推送完成 ===')
      printResult(result)
    } catch (error) {
      console.error('\n=== 推送失败 ===')
      console.error(error)
      process.exit(1)
    }
  } else {
    console.log('模式：批量URL推送')
    console.log('开始推送所有URL到百度搜索资源平台...\n')

    const urls = getAllUrls()
    console.log(`共获取到 ${urls.length} 个URL`)
    console.log('URL列表:', urls, '\n')

    try {
      const result = await pushUrls(urls)
      console.log('\n=== 推送完成 ===')
      printResult(result)
    } catch (error) {
      console.error('\n=== 推送失败 ===')
      console.error(error)
      process.exit(1)
    }
  }
}

function printResult(result) {
  if (result.success) {
    console.log(`成功推送: ${result.success} 条`)
  }
  if (result.remain) {
    console.log(`今日剩余配额: ${result.remain} 条`)
  }
  if (result.not_same_site && result.not_same_site.length > 0) {
    console.log('非本站URL:', result.not_same_site)
  }
  if (result.not_valid && result.not_valid.length > 0) {
    console.log('不合法URL:', result.not_valid)
  }
  if (result.error) {
    console.error('推送错误:', result.error, result.message)
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  pushSingleUrl,
  pushUrls,
  getAllUrls,
  main,
}
