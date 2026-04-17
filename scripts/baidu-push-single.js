const http = require('http')
const { getSiteConfig, getBaiduPushConfig } = require('../lib/config')

/**
 * 百度单条URL推送脚本
 * SEO优化：新文章上线后，自动推送单条文章URL至百度搜索资源平台
 * 配置读取：从环境变量读取，避免配置不一致
 */
const { siteUrl: BASE_URL } = getSiteConfig()
const { apiUrl: BAIDU_PUSH_API } = getBaiduPushConfig()

function pushSingleUrl(url) {
  return new Promise((resolve, reject) => {
    const postData = url
    
    const apiUrl = new URL(BAIDU_PUSH_API)
    const options = {
      hostname: apiUrl.hostname,
      port: 80,
      path: apiUrl.pathname + apiUrl.search,
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

async function main() {
  const args = process.argv.slice(2)
  const slug = args[0]

  console.log('=== 百度单条URL推送脚本 ===')
  console.log(`站点URL: ${BASE_URL}\n`)

  if (!slug) {
    console.error('错误：请提供文章slug参数')
    console.error('使用方式: npm run push:baidu:single -- "文章slug"')
    console.error('示例: npm run push:baidu:single -- "huoniweier-diandong-famen"')
    process.exit(1)
  }

  const url = `${BASE_URL}/news/${slug}`
  console.log(`模式：单条URL推送`)
  console.log(`URL: ${url}\n`)

  try {
    const result = await pushSingleUrl(url)
    console.log('\n=== 推送完成 ===')
    printResult(result)
  } catch (error) {
    console.error('\n=== 推送失败 ===')
    console.error(error)
    process.exit(1)
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
  main,
}
