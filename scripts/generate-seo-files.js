const fs = require('fs')
const path = require('path')
const { getSiteConfig } = require('../lib/config')

/**
 * SEO资源文件生成脚本
 * 配置读取：从环境变量读取，避免配置不一致
 */
const { siteUrl: BASE_URL } = getSiteConfig()
const CONTENT_DIRS = ['products', 'solutions', 'cases', 'news']

function getMdFiles(dir) {
  const fullPath = path.join(process.cwd(), 'content', dir)
  if (!fs.existsSync(fullPath)) return []
  return fs.readdirSync(fullPath)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''))
}

function generateSitemap() {
  console.log('=== 生成sitemap.xml ===')

  const today = new Date().toISOString().split('T')[0]

  const urls = []

  const fixedPages = [
    { url: '/', priority: 1.0, changefreq: 'weekly' },
    { url: '/about', priority: 0.9, changefreq: 'monthly' },
    { url: '/products', priority: 0.9, changefreq: 'weekly' },
    { url: '/solutions', priority: 0.9, changefreq: 'weekly' },
    { url: '/cases', priority: 0.9, changefreq: 'weekly' },
    { url: '/news', priority: 0.9, changefreq: 'daily' },
    { url: '/contact', priority: 0.9, changefreq: 'monthly' },
  ]

  fixedPages.forEach(page => {
    urls.push({
      loc: `${BASE_URL}${page.url}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    })
  })

  CONTENT_DIRS.forEach(dir => {
    const slugs = getMdFiles(dir)
    slugs.forEach(slug => {
      urls.push({
        loc: `${BASE_URL}/${dir}/${slug}`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.8,
      })
    })
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml')
  fs.writeFileSync(outputPath, xml, 'utf8')
  console.log(`✅ sitemap.xml 生成成功！共 ${urls.length} 个URL`)
  console.log(`   保存路径: ${outputPath}`)
}

function generateRobots() {
  console.log('\n=== 生成robots.txt ===')

  const content = `User-agent: Baiduspider
Allow: /
Allow: /about
Allow: /products
Allow: /solutions
Allow: /cases
Allow: /news
Allow: /contact
Disallow: /api
Disallow: /_next
Disallow: /static
Disallow: /admin
Disallow: /private

User-agent: *
Allow: /
Disallow: /api
Disallow: /_next
Disallow: /static
Disallow: /admin
Disallow: /private

Sitemap: ${BASE_URL}/sitemap.xml
`

  const outputPath = path.join(process.cwd(), 'public', 'robots.txt')
  fs.writeFileSync(outputPath, content, 'utf8')
  console.log('✅ robots.txt 生成成功！')
  console.log(`   保存路径: ${outputPath}`)
}

function main() {
  console.log('湖北科信达SEO资源文件生成脚本\n')
  console.log(`站点URL: ${BASE_URL}\n`)
  generateSitemap()
  generateRobots()
  console.log('\n✅ 所有SEO资源文件生成完成！')
}

if (require.main === module) {
  main()
}

module.exports = { generateSitemap, generateRobots, main }
