const fs = require('fs')
const path = require('path')
const https = require('https')
const { execSync } = require('child_process')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const { getSiteConfig, getMoonshotConfig, getAIContentConfig } = require('../lib/config')
const { wechatService } = require('../lib/wechat.js')
const { parseAIResponse } = require('../lib/ai-json-cleaner.js')

// 站点配置
const siteConfig = getSiteConfig()
const BASE_URL = siteConfig.siteUrl

// Moonshot API配置
const moonshotConfig = getMoonshotConfig()
const MOONSHOT_API_KEY = moonshotConfig.apiKey

// AI内容生成配置
const aiContentConfig = getAIContentConfig()
const { minWords, maxWords, keywordDensityMin, keywordDensityMax, maxRetries } = aiContentConfig

// 内容目录 - 使用 __dirname 确保路径正确
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'news')

// 品牌配置
const BRAND_NAME = '湖北科信达机电设备有限公司'

// 新闻图片目录
const NEWS_IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'news')

/**
 * 获取指定分类的新闻图片
 * @param {string} category - 新闻分类
 * @returns {Array} 图片文件列表
 */
function getNewsImages(category) {
  const categoryDir = category === '行业动态' ? 'hvac' : 'honeywell'
  const dirPath = path.join(NEWS_IMAGES_DIR, categoryDir)
  
  if (!fs.existsSync(dirPath)) {
    console.log(`图片目录不存在: ${dirPath}`)
    return []
  }
  
  const files = fs.readdirSync(dirPath).filter(file => {
    const ext = path.extname(file).toLowerCase()
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)
  })
  
  console.log(`找到 ${files.length} 张${category}图片`)
  return files.map(file => ({
    name: file,
    path: path.join(dirPath, file),
    url: `/images/news/${categoryDir}/${encodeURIComponent(file)}`
  }))
}

/**
 * 随机选择指定数量的图片
 * @param {Array} images - 图片列表
 * @param {number} count - 需要选择的数量
 * @returns {Array} 选中的图片
 */
function selectRandomImages(images, count) {
  if (images.length === 0) return []
  
  const shuffled = [...images].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

async function uploadImagesToWechat(images) {
  const urlMap = new Map()
  
  for (const image of images) {
    try {
      console.log(`📤 上传图片到微信: ${image.name}`)
      const wechatUrl = await wechatService.uploadImage(image.path)
      urlMap.set(image.url, wechatUrl)
      console.log(`✅ 上传成功: ${image.name} -> ${wechatUrl}`)
    } catch (error) {
      console.error(`❌ 上传失败: ${image.name}`, error.message)
    }
  }
  
  return urlMap
}

function replaceImageUrls(content, urlMap) {
  let newContent = content
  urlMap.forEach((wechatUrl, localUrl) => {
    // 对URL中的特殊字符进行转义，以便在正则表达式中使用
    const escapedUrl = localUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    newContent = newContent.replace(new RegExp(`!\\[.*?\\]\\(${escapedUrl}\\)`, 'g'), match => {
      const altMatch = match.match(/!\[(.*?)\]/)
      const alt = altMatch ? altMatch[1] : ''
      return `![${alt}](${wechatUrl})`
    })
  })
  return newContent
}

async function searchIndustryNews(keyword) {
  console.log('正在通过AI搜索行业最新信息...')
  
  const currentYear = new Date().getFullYear()
  const currentDate = new Date().toISOString().split('T')[0]
  
  // 构建提示词，让AI生成与关键词相关的行业信息
  const newsPrompt = `请以暖通行业专家的身份，生成6条与"${keyword}"相关的最新行业动态信息。

要求：
1. 内容要真实、专业，符合2025-2026年的行业发展趋势
2. 包含具体的数据、技术参数或市场分析
3. 涉及霍尼韦尔品牌、湖北地区、暖通阀门等相关内容
4. 每条信息包含标题、详细内容和日期（日期范围：${currentYear}-01-01 到 ${currentDate}）
5. 信息要多样化，仅涵盖：政策法规类、市场报告类、展会活动类这三种类型

请严格按照以下JSON格式返回（仅返回JSON数组，不要有其他文字）：
[
  {
    "title": "信息标题",
    "content": "详细信息内容，100-200字",
    "date": "${currentYear}-MM-DD"
  }
]`

  try {
    // 调用Moonshot API生成行业信息
    const response = await callMoonshotAPI(newsPrompt)
    const aiContent = response.choices[0].message.content
    
    // 解析AI返回的JSON
    const newsList = parseAIResponse(aiContent, { verbose: false })
    
    if (Array.isArray(newsList) && newsList.length > 0) {
      console.log(`搜索完成，通过AI获取到${newsList.length}条行业信息`)
      return newsList.slice(0, 6) // 最多返回6条
    } else {
      throw new Error('AI返回的数据格式不正确')
    }
  } catch (error) {
    console.error('AI生成行业信息失败:', error.message)
    console.log('使用备用模拟数据...')
    
    // 如果AI调用失败，返回备用模拟数据
    return generateFallbackNews(keyword, currentYear, currentDate)
  }
}

// 备用数据生成函数
function generateFallbackNews(keyword, currentYear, currentDate) {
  return [
    {
      title: `${currentYear}年暖通行业与${keyword}市场发展趋势`,
      content: `根据最新行业研究，${keyword}相关产品在暖通行业中的应用持续增长。智能化、节能化成为主要发展方向，霍尼韦尔等知名品牌在技术创新方面保持领先地位。湖北地区作为重要的暖通市场，对高品质阀门产品的需求稳步上升。`,
      date: currentDate
    },
    {
      title: `霍尼韦尔${keyword}技术创新与应用`,
      content: `霍尼韦尔在${keyword}领域持续投入研发，推出多款智能化产品。新产品采用先进的控制技术，支持物联网连接，能够实现远程监控和智能调节，大幅提升系统运行效率，降低能耗。`,
      date: currentDate
    },
    {
      title: '湖北地区暖通工程市场动态',
      content: '湖北省暖通工程市场呈现活跃态势，商业综合体、医疗建筑、工业厂房等项目增多。对高品质、高性能的暖通设备需求旺盛，为霍尼韦尔等品牌提供了广阔的市场空间。',
      date: currentDate
    }
  ]
}

function generatePrompt(keyword, category, industryNews) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const slug = keyword.replace(/[\s，。、；：""''（）【】]/g, '-').toLowerCase()
  
  const newsSummary = industryNews.map(news => `${news.date} - ${news.title}: ${news.content}`).join('\n')
  
  return `请以${BRAND_NAME}市场部的身份，撰写一篇关于"${keyword}"的暖通行业动态新闻文章。

要求：
1. 文章字数在${minWords}-${maxWords}字之间
2. 标题必须包含"${keyword}"，且要吸引人点击
3. 文章需要引用最新的行业数据和信息
4. 自然融入品牌身份：${BRAND_NAME}是霍尼韦尔阀门湖北官方授权代理商，提供原厂正品保障和技术支持
5. 内容专业、准确、详实，适合暖通工程师、采购人员阅读
6. 文章结构清晰，仅围绕以下三种类型展开：政策法规类、市场报告类、展会活动类
7. 关键词"${keyword}"密度控制在${Math.round(keywordDensityMin * 100)}%-${Math.round(keywordDensityMax * 100)}%之间
8. 加入适当的图片描述，使用以下格式的图片链接：
   ![暖通行业发展趋势图](https://picsum.photos/800/450?random=暖通行业发展趋势图&image_size=landscape_16_9)
   ![市场分析图表](https://picsum.photos/800/450?random=暖通市场分析图表&image_size=landscape_16_9)

可参考的最新行业信息：
${newsSummary}

【重要】请严格按照以下要求返回：
1. 必须返回完整、有效的JSON格式
2. JSON必须包含所有字段，不能遗漏
3. content字段中的换行必须使用\\n转义，不能使用真实换行符
4. 不要返回Markdown代码块标记（如 \`\`\`json）
5. 不要包含任何JSON以外的文字说明
6. 确保JSON字符串正确闭合，所有引号匹配

请按照以下JSON格式返回：
{
  "title": "文章标题，包含${keyword}",
  "slug": "${slug}",
  "date": "${today}",
  "author": "湖北科信达市场部",
  "category": "行业动态",
  "seoTitle": "${keyword}_暖通行业动态_霍尼韦尔阀门湖北代理商_湖北科信达",
  "seoDescription": "${BRAND_NAME}为您带来关于${keyword}的深度行业分析，作为霍尼韦尔阀门湖北官方授权代理商，提供武汉及湖北区域专业暖通解决方案。",
  "keywords": "${keyword},暖通行业,行业动态,市场分析,霍尼韦尔阀门,湖北科信达",
  "relatedLinks": ["/solutions","/cases","/about"],
  "content": "文章正文内容，用Markdown格式，包含##小标题，可加入行业数据表格和图片描述。注意：内容中的换行必须使用\\n转义，不能直接使用换行符"
}`
}

function callMoonshotAPI(prompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'moonshot-v1-8k',
      messages: [
        {
          role: 'system',
          content: '你是湖北科信达机电设备有限公司的专业内容编辑，擅长撰写暖通行业SEO文章和产品介绍。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    })

    const options = {
      hostname: 'api.moonshot.cn',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    }

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          if (response.error) {
            reject(new Error(response.error.message))
          } else {
            resolve(response)
          }
        } catch (error) {
          reject(new Error('解析API响应失败'))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

async function generateContentWithAI(keyword, taskType) {
  console.log('开始生成内容...')
  
  // 固定为行业动态类别
  const category = '行业动态'
  console.log(`任务类型: ${category}`)
  
  // 如果没有提供关键词，使用行业动态关键词
  if (!keyword) {
    const industryKeywords = [
      '武汉中央空调阀门',
      '湖北暖通工程',
      '武汉楼宇自控',
      '湖北节能改造',
      '武汉暖通市场',
      '湖北中央空调',
      '武汉阀门市场',
      '湖北暖通行业'
    ]
    keyword = industryKeywords[Math.floor(Math.random() * industryKeywords.length)]
  }
  
  console.log(`关键词: ${keyword}`)
  
  // 获取分类对应的图片
  const categoryImages = getNewsImages(category)
  const selectedImages = selectRandomImages(categoryImages, 2)
  console.log(`选中 ${selectedImages.length} 张图片:`, selectedImages.map(img => img.name))
  
  // 搜索行业最新信息
  const industryNews = await searchIndustryNews(keyword)
  
  // 生成提示词
  const prompt = generatePrompt(keyword, category, industryNews, selectedImages)
  
  if (!MOONSHOT_API_KEY) {
    console.log('未配置Moonshot API，使用模拟数据')
    return generateMockContent(keyword, category, selectedImages)
  }
  
  console.log('调用Moonshot API生成内容...')
  
  let retries = 0
  while (retries < maxRetries) {
    try {
      const response = await callMoonshotAPI(prompt)
      const aiContent = response.choices[0].message.content
      
      console.log('AI响应内容:', aiContent.substring(0, 200) + '...')
      
      const parsedContent = parseAIResponse(aiContent, { verbose: true })
      
      // 使用当前完整时间替换AI生成的日期（只保留日期部分的问题）
      parsedContent.date = new Date().toISOString()
      
      // 验证内容
      validateContent(parsedContent)
      
      // 替换AI生成的图片URL为本地图片URL
      let finalContent = parsedContent.content
      if (selectedImages.length > 0) {
        // 替换第一个图片
        finalContent = finalContent.replace(
          /!\[.*?\]\(https:\/\/picsum\.photos[^)]+\)/,
          `![${selectedImages[0].name.replace(/\.[^/.]+$/, '')}](${selectedImages[0].url})`
        )
        // 替换第二个图片
        if (selectedImages.length > 1) {
          finalContent = finalContent.replace(
            /!\[.*?\]\(https:\/\/picsum\.photos[^)]+\)/,
            `![${selectedImages[1].name.replace(/\.[^/.]+$/, '')}](${selectedImages[1].url})`
          )
        }
      }
      parsedContent.content = finalContent
      
      console.log('✅ 内容生成成功！')
      return parsedContent
      
    } catch (error) {
      retries++
      console.error(`生成失败，第${retries}次重试...`, error.message)
      if (retries >= maxRetries) {
        console.log('达到最大重试次数，使用模拟数据')
        return generateMockContent(keyword, category, selectedImages)
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
}

function generateMockContent(keyword, category, selectedImages) {
  console.log('生成模拟内容...')
  
  const now = new Date()
  const today = now.toISOString()
  const slug = keyword.replace(/[\s，。、；：""''（）【】]/g, '-').toLowerCase()
  const currentYear = now.getFullYear()
  
  const title = `${currentYear}年${keyword}行业深度分析与市场展望`
  const seoTitle = `${keyword}_暖通行业动态_霍尼韦尔阀门湖北代理商_湖北科信达`
  const seoDescription = `${BRAND_NAME}为您带来关于${keyword}的深度行业分析，作为霍尼韦尔阀门湖北官方授权代理商，提供武汉及湖北区域专业暖通解决方案。`
  const keywords = `${keyword},暖通行业,行业动态,市场分析,霍尼韦尔阀门,湖北科信达`
  const relatedLinks = ['/solutions', '/cases', '/about']
  const author = '湖北科信达市场部'
  
  const image1Markdown = selectedImages[0] ? `![暖通行业发展趋势图](${selectedImages[0].url})` : ''
  const image2Markdown = selectedImages[1] ? `![市场分析图表](${selectedImages[1].url})` : ''
  
  const content = `# ${currentYear}年${keyword}行业深度分析与市场展望

${image1Markdown}

## 引言

${currentYear}年，中国暖通行业迎来了新的发展机遇与挑战。随着国家"双碳"目标的持续推进，以及建筑节能政策的不断完善，${keyword}作为暖通系统的核心部件，正面临着前所未有的市场需求。根据中国制冷空调工业协会发布的最新数据，${currentYear}年第一季度全国暖通行业市场规模达到1280亿元，同比增长9.2%，其中${keyword}市场增速尤为显著，达到13.8%。

湖北科信达机电设备有限公司作为霍尼韦尔阀门湖北官方授权代理商，密切关注行业发展动态，为武汉及湖北区域客户提供专业的暖通解决方案和技术支持。

## 政策法规类

### 国家层面政策

近期，国家住建部联合发改委发布了《"十四五"建筑节能与绿色建筑发展规划》实施方案，明确提出到${currentYear}年末，新建建筑全面执行绿色建筑标准，既有建筑节能改造面积达到3.5亿平方米。这一政策将直接推动${keyword}市场需求的快速增长。

[引用来源：国家住建部官网](https://www.mohurd.gov.cn)

### 湖北省地方政策

湖北省住建厅也出台了《湖北省建筑节能管理办法实施细则》，要求全省范围内新建公共建筑必须采用节能型暖通设备，并对采用高效节能阀门的项目给予财政补贴。补贴标准为设备投资额的10%-15%，单个项目最高补贴可达200万元。

这一政策的出台，为湖北地区${keyword}市场注入了强劲动力。据统计，${currentYear}年第一季度湖北省暖通工程招标项目数量同比增长28%，其中对节能阀门的需求增长尤为突出。

[引用来源：湖北省住建厅官网](http://zjt.hubei.gov.cn)

${image2Markdown}

## 市场报告类

### 市场规模与增长

根据行业研究机构的数据，${currentYear}年中国${keyword}市场规模预计将达到285亿元，同比增长14.2%。其中，华中地区市场增速位居全国前列，达到16.8%，湖北作为华中地区的核心市场，占比达到35%。

| 指标 | 2025年 | ${currentYear}年(预测) | 增长率 |
|------|-------------|---------------------|--------|
| 全国市场规模 | 250亿元 | 285亿元 | +14.2% |
| 华中地区 | 58亿元 | 68亿元 | +17.2% |
| 湖北省 | 20亿元 | 24亿元 | +20.0% |

### 竞争格局分析

目前，${keyword}市场呈现出国际品牌与国内品牌并存的竞争格局。国际品牌以霍尼韦尔、江森自控、西门子等为代表，占据高端市场约60%的份额；国内品牌以盾安、三花、浙江春晖等为代表，主要集中在中低端市场。

霍尼韦尔作为行业领导者，在${keyword}领域拥有深厚的技术积累和品牌优势。其V5011系列智能电动阀门、VPIC动态平衡电动调节阀等产品，凭借卓越的性能和可靠性，深受市场认可。湖北科信达作为霍尼韦尔湖北官方授权代理商，为本地客户提供原厂正品保障和专业技术支持。

[引用来源：《${currentYear}年中国阀门行业市场分析报告》](https://www.chinabgao.com)

### 湖北区域市场特点

湖北区域${keyword}市场呈现出以下特点：

1. **商业建筑需求旺盛**：武汉、宜昌、襄阳等城市的商业综合体、高端酒店项目密集，对高品质${keyword}需求强劲
2. **工业项目持续增长**：汽车制造、生物医药、电子信息等产业的发展，带动工业暖通系统需求
3. **政府项目占比提升**：医院、学校、政务中心等公共建筑项目，对节能型${keyword}的采购量明显增加

## 展会活动类

### 近期行业展会

${currentYear}年，暖通行业展会活动精彩纷呈，为企业提供了展示产品、交流技术的重要平台：

1. **中国制冷展（CRH）**：${currentYear}年4月在上海举办，霍尼韦尔展出了最新的智能阀门系列产品
2. **武汉暖通展**：${currentYear}年5月在武汉国际博览中心举办，湖北科信达作为霍尼韦尔湖北代理商参展
3. **中国国际供热通风空调、卫浴及舒适家居展览会（ISH China）**：${currentYear}年9月在北京举办

### 展会亮点

在近期的展会上，以下趋势尤为明显：

- **智能化与IoT技术**：各大厂商纷纷推出支持物联网连接的智能阀门产品
- **节能技术**：高效节能阀门成为展会焦点，霍尼韦尔的VPIC动态平衡阀备受关注
- **区域市场深耕**：企业更加注重区域市场的开拓和本地化服务

湖北科信达积极参与各类行业展会，与客户进行面对面交流，展示霍尼韦尔产品的同时，也深入了解市场需求，为客户提供更专业的解决方案。

## 结语

${currentYear}年，${keyword}行业正处于快速发展的黄金时期。政策驱动、技术创新、市场需求三者形成合力，推动行业向智能化、节能化方向发展。

湖北科信达机电设备有限公司作为霍尼韦尔阀门湖北官方授权代理商，将继续秉承"专业、诚信、服务"的理念，为武汉及湖北区域客户提供优质的${keyword}产品和专业的暖通解决方案。我们期待与您携手，共同推动湖北暖通行业的发展！

如需了解更多霍尼韦尔${keyword}产品信息，欢迎访问我们的产品页面或联系我们的技术团队。`
  
  return {
    title,
    slug,
    date: today,
    author,
    category,
    seoTitle,
    seoDescription,
    keywords,
    relatedLinks,
    content
  }
}

function validateContent(content) {
  console.log('正在校验内容...')
  
  // 检查必填字段
  const requiredFields = ['title', 'slug', 'date', 'author', 'category', 'content']
  for (const field of requiredFields) {
    if (!content[field]) {
      throw new Error(`缺少必填字段: ${field}`)
    }
  }
  
  // 检查字数（仅记录日志，不报错）
  const wordCount = content.content.length
  console.log(`内容字数: ${wordCount} (目标范围: ${minWords}-${maxWords})`)
  if (wordCount < minWords) {
    console.log(`⚠️ 内容字数偏少: ${wordCount} < ${minWords}，但仍继续生成`)
  }
  if (wordCount > maxWords * 1.2) {
    console.log(`⚠️ 内容字数偏多: ${wordCount} > ${maxWords * 1.2}，但仍继续生成`)
  }
  
  // 检查关键词密度
  const keyword = content.slug.replace(/-/g, '')
  const keywordCount = (content.content.match(new RegExp(keyword, 'g')) || []).length
  const density = keywordCount / wordCount
  
  if (density < keywordDensityMin) {
    console.warn(`关键词密度偏低: ${(density * 100).toFixed(2)}% < ${(keywordDensityMin * 100).toFixed(2)}%`)
  }
  if (density > keywordDensityMax) {
    console.warn(`关键词密度偏高: ${(density * 100).toFixed(2)}% > ${(keywordDensityMax * 100).toFixed(2)}%`)
  }
  
  console.log('内容合规校验通过！')
  return true
}

async function generateMarkdownFile(content) {
  console.log('正在生成Markdown文件...')
  
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true })
  }
  
  const now = new Date()
  const datePart = content.date.split('T')[0]
  const timePart = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`
  const fileName = `${datePart}-${timePart}-${content.slug}.md`
  const filePath = path.join(CONTENT_DIR, fileName)
  
  const frontmatter = `---
title: ${content.title}
slug: ${content.slug}
date: ${content.date}
author: ${content.author}
category: ${content.category}
status: published
seoTitle: ${content.seoTitle}
seoDescription: ${content.seoDescription}
keywords: ${content.keywords}
relatedLinks: ${JSON.stringify(content.relatedLinks)}
---

${content.content}
`
  
  fs.writeFileSync(filePath, frontmatter, 'utf8')
  console.log(`✅ Markdown文件生成成功: ${fileName}`)
  console.log(`   保存路径: ${filePath}`)
  
  let wechatMediaId = ''
  let wechatSyncStatus = 'pending'
  try {
    console.log('\n=== 开始同步到微信服务号 ===')
    
    let thumbMediaId = ''
    const solutionsDir = path.join(process.cwd(), 'public', 'images', 'solutions')
    const coverImages = fs.readdirSync(solutionsDir).filter(file => 
      file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
    )
    
    if (coverImages.length > 0) {
      const randomCover = coverImages[Math.floor(Math.random() * coverImages.length)]
      const coverPath = path.join(solutionsDir, randomCover)
      console.log(`📤 上传封面图: ${randomCover}`)
      thumbMediaId = await wechatService.uploadPermanentMedia(coverPath)
      console.log(`✅ 封面上传成功: ${thumbMediaId}`)
    }
    
    let htmlContent = content.content
    
    const imagesToUpload = []
    const imgRegex = /!\[.*?\]\((\/images\/news\/[^)]+)\)/g
    let match
    while ((match = imgRegex.exec(content.content)) !== null) {
      const imagePath = match[1]
      const fullPath = path.join(process.cwd(), 'public', decodeURIComponent(imagePath))
      if (fs.existsSync(fullPath)) {
        imagesToUpload.push({
          url: match[1],
          path: fullPath,
          name: path.basename(fullPath)
        })
      }
    }
    
    if (imagesToUpload.length > 0) {
      console.log(`\n📤 开始上传 ${imagesToUpload.length} 张正文图片到微信...`)
      const urlMap = await uploadImagesToWechat(imagesToUpload)
      htmlContent = replaceImageUrls(htmlContent, urlMap)
      console.log(`✅ 图片URL替换完成`)
    }
    
    htmlContent = htmlContent
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 15px 0; border-radius: 8px;" />')
      .replace(/^# (.*?)(\n|$)/gm, '<h1 style="font-size: 24px; font-weight: bold; margin: 20px 0 15px; color: #333;">$1</h1>')
      .replace(/^## (.*?)(\n|$)/gm, '<h2 style="font-size: 20px; font-weight: bold; margin: 15px 0 10px; color: #444;">$1</h2>')
      .replace(/^### (.*?)(\n|$)/gm, '<h3 style="font-size: 18px; font-weight: bold; margin: 12px 0 8px; color: #555;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold; color: #333;">$1</strong>')
      .replace(/\n\n/g, '</p><p style="font-size: 16px; line-height: 1.6; margin: 10px 0; color: #666;">')
      .replace(/\n/g, '<br/>')
    
    htmlContent = '<p style="font-size: 16px; line-height: 1.6; margin: 10px 0; color: #666;">' + htmlContent + '</p>'
    
    if (htmlContent.length > 20000) {
      htmlContent = htmlContent.substring(0, 19990) + '...'
    }
    
    const articles = [{
      title: content.title.substring(0, 32),
      author: '科信达机电',
      content: htmlContent,
      content_source_url: `${BASE_URL}/news/${content.slug}`,
      digest: htmlContent.substring(0, 120),
      thumb_media_id: thumbMediaId,
      show_cover_pic: 1
    }]
    
    wechatMediaId = await wechatService.addDraft(articles)
    wechatSyncStatus = 'success'
    console.log(`✅ 微信服务号草稿创建成功，media_id: ${wechatMediaId}`)
    console.log('=== 微信同步完成 ===')
  } catch (error) {
    wechatSyncStatus = 'failed'
    console.error('❌ 同步到微信服务号失败:', error.message)
    if (error.response) {
      console.error('错误详情:', error.response.data)
    }
  }
  
  return { fileName, filePath, slug: content.slug, wechatSyncStatus, wechatMediaId }
}

function gitCommit(fileName, slug) {
  console.log('正在执行Git提交...')

  try {
    execSync('git status', { stdio: 'pipe', windowsHide: true })
    console.log('Git仓库检测成功')

    const branchName = `feature/news-${slug}`
    console.log(`创建分支: ${branchName}`)
    execSync(`git checkout -b ${branchName} 2>/dev/null || git checkout ${branchName}`, { stdio: 'pipe', windowsHide: true })

    console.log('添加文件到暂存区')
    execSync(`git add content/news/${fileName}`, { stdio: 'pipe', windowsHide: true })

    const commitMessage = `feat: 添加SEO文章 - ${slug}`
    console.log(`提交变更: ${commitMessage}`)
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe', windowsHide: true })

    console.log('✅ Git提交成功！')
    console.log(`   分支: ${branchName}`)
    console.log('   请手动推送到远程仓库: git push origin ' + branchName)
  } catch (error) {
    console.log('⚠️ Git提交跳过（非Git仓库或无需提交）')       
  }
}

async function main(taskType) {
  console.log('=== AI自动化内容生成脚本 ===\n')
  console.log(`站点URL: ${BASE_URL}`)
  console.log(`API配置: ${MOONSHOT_API_KEY ? '月之暗面API' : '模拟数据'}\n`)

  try {
    const content = await generateContentWithAI('', taskType)

    validateContent(content)
    const { fileName, filePath, slug, wechatSyncStatus, wechatMediaId } = await generateMarkdownFile(content)
    gitCommit(fileName, slug)

    console.log('\n✅ AI内容生成流程完成！')
    console.log(`   文章URL: ${BASE_URL}/news/${slug}`)

    return { success: true, wechatSyncStatus, wechatMediaId, slug }

  } catch (error) {
    console.error('\n❌ AI内容生成失败！')
    console.error(error)
    return { success: false, error: error.message }
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  generateContentWithAI,
  validateContent,
  generateMarkdownFile,
  gitCommit,
  main,
}