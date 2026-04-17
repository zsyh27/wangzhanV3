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
// 注意：虽然目录仍叫news，但内容已调整为知识库文章
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'news')

// 品牌配置
const BRAND_NAME = '湖北科信达机电设备有限公司'

// 知识库文章分类配置
const KNOWLEDGE_CATEGORIES = {
  '产品选型类': {
    priority: 'P0',
    frequency: '每周1篇',
    keywords: ['选型参数', '选型指南', '产品参数', '选型建议'],
    examples: ['V5011B2W霍尼韦尔电动二通阀选型参数详解', '霍尼韦尔V5GV法兰阀选型指南']
  },
  '安装指导类': {
    priority: 'P0',
    frequency: '每周1篇',
    keywords: ['安装方法', '安装步骤', '接线方法', '调试指南'],
    examples: ['霍尼韦尔V5GV法兰阀安装注意事项', '霍尼韦尔电动球阀安装调试指南']
  },
  '故障排查类': {
    priority: 'P1',
    frequency: '每两周1篇',
    keywords: ['故障排查', '常见问题', '维修方法', '故障代码'],
    examples: ['风机盘管电动二通阀常见故障排查', '中央空调水系统阀门常见故障排查']
  },
  '案例应用类': {
    priority: 'P1',
    frequency: '每月1篇',
    keywords: ['项目案例', '应用案例', '工程案例', '成功案例'],
    examples: ['武汉同济医院暖通项目阀门选型案例', '商业综合体暖通阀门选型案例']
  },
  '技术对比类': {
    priority: 'P1',
    frequency: '每月1篇',
    keywords: ['技术对比', '产品对比', '选型对比', '优缺点分析'],
    examples: ['霍尼韦尔电动调节阀与执行器匹配指南', '电动座阀vs电动球阀选型对比']
  },
  '售后服务类': {
    priority: 'P2',
    frequency: '每月1篇',
    keywords: ['售后服务', '质保政策', '维修服务', '技术支持'],
    examples: ['霍尼韦尔阀门质保政策与售后服务', '霍尼韦尔阀门维修服务流程']
  }
}

// 知识库文章生成计划（前3个月）
const CONTENT_PLAN = [
  { week: 1, title: 'V5011B2W霍尼韦尔电动二通阀选型参数详解', category: '产品选型类', keyword: 'V5011B2W选型参数' },
  { week: 2, title: '霍尼韦尔V5GV法兰阀安装注意事项', category: '安装指导类', keyword: 'V5GV法兰阀安装' },
  { week: 3, title: '风机盘管电动二通阀常见故障排查', category: '故障排查类', keyword: '风机盘管电动阀故障' },
  { week: 4, title: '霍尼韦尔电动调节阀与执行器匹配指南', category: '技术对比类', keyword: '电动阀执行器匹配' },
  { week: 5, title: 'V5011S2W不锈钢阀门选型参数详解', category: '产品选型类', keyword: 'V5011S2W选型参数' },
  { week: 6, title: '霍尼韦尔电动球阀安装调试指南', category: '安装指导类', keyword: '电动球阀安装' },
  { week: 7, title: '武汉同济医院暖通项目阀门选型案例', category: '案例应用类', keyword: '医院暖通阀门选型' },
  { week: 8, title: '霍尼韦尔阀门质保政策与售后服务', category: '售后服务类', keyword: '霍尼韦尔阀门质保' },
  { week: 9, title: 'V6GV高压电动座阀选型参数详解', category: '产品选型类', keyword: 'V6GV选型参数' },
  { week: 10, title: '霍尼韦尔电动蝶阀安装注意事项', category: '安装指导类', keyword: '电动蝶阀安装' },
  { week: 11, title: '中央空调水系统阀门常见故障排查', category: '故障排查类', keyword: '中央空调阀门故障' },
  { week: 12, title: '商业综合体暖通阀门选型案例', category: '案例应用类', keyword: '商业综合体阀门选型' },
]

/**
 * 获取指定分类的知识库文章图片
 * @param {string} category - 知识库文章分类
 * @returns {Array} 图片文件列表
 */
function getKnowledgeImages(category) {
  const categoryDir = category.includes('选型') ? 'selection' : 
                     category.includes('安装') ? 'installation' :
                     category.includes('故障') ? 'troubleshooting' :
                     category.includes('案例') ? 'cases' :
                     category.includes('对比') ? 'comparison' : 'service'
  
  const dirPath = path.join(process.cwd(), 'public', 'images', 'news', categoryDir)
  
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

/**
 * 根据文章分类生成对应的Prompt
 * @param {string} title - 文章标题
 * @param {string} category - 知识库文章分类
 * @param {string} keyword - 目标关键词
 * @returns {string} 生成的Prompt
 */
function generateKnowledgePrompt(title, category, keyword) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const slug = title.replace(/[\s，。、；：""''（）【】]/g, '-').toLowerCase()
  
  let prompt = ''
  
  if (category === '产品选型类') {
    prompt = `请以${BRAND_NAME}技术工程师的身份，撰写一篇关于"${title}"的知识库文章。

目标：帮助工程商快速选型
要求：
1. 文章字数在${minWords}-${maxWords}字之间
2. 标题必须包含"${keyword}"
3. 必须包含：技术参数表格、选型计算公式、适用场景
4. 关键词布局：产品型号、技术参数、选型指南
5. 自然融入品牌身份：${BRAND_NAME}是霍尼韦尔阀门湖北官方授权代理商，提供原厂正品保障和技术支持
6. 内容专业、准确、详实，适合暖通工程师、采购人员阅读
7. 关键词"${keyword}"密度控制在${Math.round(keywordDensityMin * 100)}%-${Math.round(keywordDensityMax * 100)}%之间
8. CTA引导：文末添加"获取详细选型手册"按钮

文章结构（严格按照以下结构）：
# 文章标题（H1，包含核心关键词）
## 一、问题背景/适用场景（H2）
（描述工程商在什么情况下会遇到这个问题）
## 二、技术参数详解（H2）
（产品参数表格，对比不同型号）
| 参数项 | 型号A | 型号B | 型号C |
|--------|-------|-------|-------|
| 口径 | DN15 | DN20 | DN25 |
| 压力等级 | PN16 | PN16 | PN16 |
## 三、选型建议/操作步骤（H2）
（基于实际项目经验给出建议）
## 四、常见问题（H2）
（FAQ形式，3-5个问题）
**Q1: 问题1？**
A: 答案1...
**Q2: 问题2？**
A: 答案2...
## 五、联系我们（H2）
如需了解更多详情或获取产品报价，请联系我们的技术工程师：
- 电话：139-0711-7179
- [获取详细选型手册](/contact)

【重要】请严格按照以下要求返回：
1. 必须返回完整、有效的JSON格式
2. JSON必须包含所有字段，不能遗漏
3. content字段中的换行必须使用\\n转义，不能使用真实换行符
4. 不要返回Markdown代码块标记
5. 不要包含任何JSON以外的文字说明
6. 确保JSON字符串正确闭合，所有引号匹配

请按照以下JSON格式返回：
{
  "title": "${title}",
  "slug": "${slug}",
  "date": "${today}",
  "author": "技术工程师",
  "category": "知识库文章",
  "tags": ["霍尼韦尔阀门", "选型指导", "产品型号"],
  "seoTitle": "${keyword}_选型参数_霍尼韦尔阀门湖北代理商",
  "seoDescription": "湖北科信达为您详细介绍${keyword}，提供霍尼韦尔阀门选型指导、技术参数、价格咨询，服务暖通工程商10年+。",
  "keywords": "${keyword},霍尼韦尔阀门选型,技术参数,湖北科信达",
  "relatedLinks": ["/products", "/selection-guide", "/contact"],
  "content": "文章正文内容，用Markdown格式，严格按照上面的6部分结构。注意：内容中的换行必须使用\\n转义，不能直接使用换行符"
}`
  } else if (category === '安装指导类') {
    prompt = `请以${BRAND_NAME}技术工程师的身份，撰写一篇关于"${title}"的知识库文章。

目标：降低安装错误率，建立专业形象
要求：
1. 文章字数在${minWords}-${maxWords}字之间
2. 标题必须包含"${keyword}"
3. 必须包含：安装步骤图解、常见问题、注意事项
4. 关键词布局：安装方法、安装视频、安装规范
5. 自然融入品牌身份：${BRAND_NAME}是霍尼韦尔阀门湖北官方授权代理商，提供原厂正品保障和技术支持
6. 内容专业、准确、详实，适合暖通工程师、采购人员阅读
7. 关键词"${keyword}"密度控制在${Math.round(keywordDensityMin * 100)}%-${Math.round(keywordDensityMax * 100)}%之间
8. CTA引导：文末添加"联系技术工程师"按钮

文章结构（严格按照以下结构）：
# 文章标题（H1，包含核心关键词）
## 一、安装前准备（H2）
（工具准备、检查清单、安全注意事项）
## 二、详细安装步骤（H2）
（分步骤详细说明，每步配图解描述）
## 三、接线方法（H2）
（电气接线图、接线步骤、注意事项）
## 四、调试指南（H2）
（调试步骤、参数设置、验证方法）
## 五、常见问题（H2）
（FAQ形式，3-5个问题）
## 六、联系我们（H2）
如需技术支持，请联系我们的技术工程师：
- 电话：139-0711-7179
- [联系技术工程师](/contact)

【重要】请严格按照以下要求返回：
1. 必须返回完整、有效的JSON格式
2. JSON必须包含所有字段，不能遗漏
3. content字段中的换行必须使用\\n转义，不能使用真实换行符
4. 不要返回Markdown代码块标记
5. 不要包含任何JSON以外的文字说明
6. 确保JSON字符串正确闭合，所有引号匹配

请按照以下JSON格式返回：
{
  "title": "${title}",
  "slug": "${slug}",
  "date": "${today}",
  "author": "技术工程师",
  "category": "知识库文章",
  "tags": ["霍尼韦尔阀门", "安装指导", "技术支持"],
  "seoTitle": "${keyword}_安装方法_霍尼韦尔阀门湖北代理商",
  "seoDescription": "湖北科信达为您提供${keyword}，详细的安装步骤、接线方法、调试指南，霍尼韦尔阀门湖北官方授权代理商。",
  "keywords": "${keyword},霍尼韦尔阀门安装,安装步骤,湖北科信达",
  "relatedLinks": ["/products", "/contact"],
  "content": "文章正文内容，用Markdown格式，严格按照上面的6部分结构。注意：内容中的换行必须使用\\n转义，不能直接使用换行符"
}`
  } else if (category === '故障排查类') {
    prompt = `请以${BRAND_NAME}技术工程师的身份，撰写一篇关于"${title}"的知识库文章。

目标：解决工程商实际问题
要求：
1. 文章字数在${minWords}-${maxWords}字之间
2. 标题必须包含"${keyword}"
3. 必须包含：故障现象、原因分析、解决方案
4. 关键词布局：故障代码、维修方法、常见问题
5. 自然融入品牌身份：${BRAND_NAME}是霍尼韦尔阀门湖北官方授权代理商，提供原厂正品保障和技术支持
6. 内容专业、准确、详实，适合暖通工程师、采购人员阅读
7. 关键词"${keyword}"密度控制在${Math.round(keywordDensityMin * 100)}%-${Math.round(keywordDensityMax * 100)}%之间
8. CTA引导：文末添加"预约上门检修"按钮

文章结构（严格按照以下结构）：
# 文章标题（H1，包含核心关键词）
## 一、常见故障现象（H2）
（列出5-8个常见故障现象）
## 二、故障原因分析（H2）
（针对每个故障现象分析可能的原因）
## 三、排查与解决方案（H2）
（分步骤排查方法和解决方案）
## 四、预防措施（H2）
（如何预防此类故障发生）
## 五、常见问题（H2）
（FAQ形式，3-5个问题）
## 六、联系我们（H2）
如需上门检修，请联系我们的技术工程师：
- 电话：139-0711-7179
- [预约上门检修](/contact)

【重要】请严格按照以下要求返回：
1. 必须返回完整、有效的JSON格式
2. JSON必须包含所有字段，不能遗漏
3. content字段中的换行必须使用\\n转义，不能使用真实换行符
4. 不要返回Markdown代码块标记
5. 不要包含任何JSON以外的文字说明
6. 确保JSON字符串正确闭合，所有引号匹配

请按照以下JSON格式返回：
{
  "title": "${title}",
  "slug": "${slug}",
  "date": "${today}",
  "author": "技术工程师",
  "category": "知识库文章",
  "tags": ["霍尼韦尔阀门", "故障排查", "维修"],
  "seoTitle": "${keyword}_故障排查_霍尼韦尔阀门湖北代理商",
  "seoDescription": "湖北科信达为您提供${keyword}，详细的故障排查方法、原因分析、解决方案，霍尼韦尔阀门湖北官方授权代理商。",
  "keywords": "${keyword},霍尼韦尔阀门故障,维修方法,湖北科信达",
  "relatedLinks": ["/products", "/contact"],
  "content": "文章正文内容，用Markdown格式，严格按照上面的6部分结构。注意：内容中的换行必须使用\\n转义，不能直接使用换行符"
}`
  } else {
    prompt = `请以${BRAND_NAME}技术工程师的身份，撰写一篇关于"${title}"的知识库文章。

要求：
1. 文章字数在${minWords}-${maxWords}字之间
2. 标题必须包含"${keyword}"
3. 自然融入品牌身份：${BRAND_NAME}是霍尼韦尔阀门湖北官方授权代理商，提供原厂正品保障和技术支持
4. 内容专业、准确、详实，适合暖通工程师、采购人员阅读
5. 关键词"${keyword}"密度控制在${Math.round(keywordDensityMin * 100)}%-${Math.round(keywordDensityMax * 100)}%之间

【重要】请严格按照以下要求返回：
1. 必须返回完整、有效的JSON格式
2. JSON必须包含所有字段，不能遗漏
3. content字段中的换行必须使用\\n转义，不能使用真实换行符
4. 不要返回Markdown代码块标记
5. 不要包含任何JSON以外的文字说明
6. 确保JSON字符串正确闭合，所有引号匹配

请按照以下JSON格式返回：
{
  "title": "${title}",
  "slug": "${slug}",
  "date": "${today}",
  "author": "技术工程师",
  "category": "知识库文章",
  "tags": ["霍尼韦尔阀门", "知识库文章"],
  "seoTitle": "${keyword}_霍尼韦尔阀门湖北代理商",
  "seoDescription": "湖北科信达为您介绍${keyword}，霍尼韦尔阀门湖北官方授权代理商，服务暖通工程商10年+。",
  "keywords": "${keyword},霍尼韦尔阀门,湖北科信达",
  "relatedLinks": ["/products", "/contact"],
  "content": "文章正文内容，用Markdown格式。注意：内容中的换行必须使用\\n转义，不能直接使用换行符"
}`
  }
  
  return prompt
}

function callMoonshotAPI(prompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'moonshot-v1-8k',
      messages: [
        {
          role: 'system',
          content: '你是湖北科信达机电设备有限公司的专业技术工程师，擅长撰写霍尼韦尔阀门选型指导、安装指南、故障排查等技术文章。'
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

async function generateKnowledgeContent(planIndex) {
  console.log('开始生成知识库文章...')
  
  const plan = CONTENT_PLAN[planIndex % CONTENT_PLAN.length]
  console.log(`文章主题: ${plan.title}`)
  console.log(`文章分类: ${plan.category}`)
  console.log(`目标关键词: ${plan.keyword}`)
  
  const prompt = generateKnowledgePrompt(plan.title, plan.category, plan.keyword)
  
  if (!MOONSHOT_API_KEY) {
    console.log('未配置Moonshot API，使用模拟数据')
    return generateMockKnowledgeContent(plan.title, plan.category, plan.keyword)
  }
  
  console.log('调用Moonshot API生成内容...')
  
  let retries = 0
  while (retries < maxRetries) {
    try {
      const response = await callMoonshotAPI(prompt)
      const aiContent = response.choices[0].message.content
      
      console.log('AI响应内容:', aiContent.substring(0, 200) + '...')
      
      const parsedContent = parseAIResponse(aiContent, { verbose: true })
      
      parsedContent.date = new Date().toISOString()
      
      validateContent(parsedContent)
      
      console.log('✅ 内容生成成功！')
      return parsedContent
      
    } catch (error) {
      retries++
      console.error(`生成失败，第${retries}次重试...`, error.message)
      if (retries >= maxRetries) {
        console.log('达到最大重试次数，使用模拟数据')
        return generateMockKnowledgeContent(plan.title, plan.category, plan.keyword)
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
}

function generateMockKnowledgeContent(title, category, keyword) {
  console.log('生成模拟知识库内容...')
  
  const now = new Date()
  const today = now.toISOString()
  const slug = title.replace(/[\s，。、；：""''（）【】]/g, '-').toLowerCase()
  
  const content = `# ${title}

## 一、问题背景/适用场景

在暖通工程实际应用中，${keyword}是工程商经常遇到的问题。湖北科信达作为霍尼韦尔阀门湖北官方授权代理商，结合10年+的行业经验，为您详细介绍相关知识。

## 二、技术参数详解

| 参数项 | 数值 |
|--------|------|
| 口径范围 | DN15-DN150 |
| 压力等级 | PN16 |
| 介质温度 | -10℃~120℃ |
| 控制方式 | 0-10V/4-20mA |

## 三、选型建议/操作步骤

根据我们的实际项目经验，建议按照以下步骤进行操作：

1. 首先确认系统参数
2. 根据工况选择合适的型号
3. 咨询专业技术人员确认
4. 湖北科信达可为您提供免费选型指导

## 四、常见问题

**Q1: 如何选择合适的型号？**
A: 请联系湖北科信达技术团队，我们将根据您的具体工况提供专业建议。

**Q2: 产品质保期是多长？**
A: 霍尼韦尔阀门产品质保期为18个月，湖北科信达提供原厂质保服务。

## 五、联系我们

如需了解更多详情或获取技术支持，请联系我们的技术工程师：
- 电话：139-0711-7179
- [联系我们](/contact)`
  
  return {
    title,
    slug,
    date: today,
    author: '技术工程师',
    category: '知识库文章',
    tags: ['霍尼韦尔阀门', '知识库文章', category],
    seoTitle: `${keyword}_霍尼韦尔阀门湖北代理商`,
    seoDescription: `湖北科信达为您介绍${title}，霍尼韦尔阀门湖北官方授权代理商，服务暖通工程商10年+。`,
    keywords: `${keyword},霍尼韦尔阀门,湖北科信达`,
    relatedLinks: ['/products', '/selection-guide', '/contact'],
    content
  }
}

function validateContent(content) {
  console.log('正在校验内容...')
  
  const requiredFields = ['title', 'slug', 'date', 'author', 'category', 'content']
  for (const field of requiredFields) {
    if (!content[field]) {
      throw new Error(`缺少必填字段: ${field}`)
    }
  }
  
  const wordCount = content.content.length
  console.log(`内容字数: ${wordCount} (目标范围: ${minWords}-${maxWords})`)
  
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
description: "${content.seoDescription}"
date: ${content.date}
author: ${content.author}
category: ${content.category}
tags: ${JSON.stringify(content.tags)}
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
  
  return { fileName, filePath, slug: content.slug }
}

async function main(planIndex) {
  console.log('=== AI自动化知识库文章生成脚本 ===\n')
  console.log(`站点URL: ${BASE_URL}`)
  console.log(`API配置: ${MOONSHOT_API_KEY ? '月之暗面API' : '模拟数据'}\n`)

  try {
    const content = await generateKnowledgeContent(planIndex || 0)
    validateContent(content)
    const { fileName, filePath, slug } = await generateMarkdownFile(content)

    console.log('\n✅ 知识库文章生成流程完成！')
    console.log(`   文章URL: ${BASE_URL}/news/${slug}`)

    return { success: true, slug }

  } catch (error) {
    console.error('\n❌ 知识库文章生成失败！')
    console.error(error)
    return { success: false, error: error.message }
  }
}

if (require.main === module) {
  const planIndex = process.argv[2] ? parseInt(process.argv[2]) - 1 : 0
  main(planIndex)
}

module.exports = {
  generateKnowledgeContent,
  validateContent,
  generateMarkdownFile,
  main,
  KNOWLEDGE_CATEGORIES,
  CONTENT_PLAN
}