import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'

/**
 * 内容类型定义
 */
export type ContentType = 'products' | 'solutions' | 'cases' | 'news' | 'selection-guide'

/**
 * 基础内容元数据接口
 */
export interface BaseFrontmatter {
  title: string
  slug: string
  date: string
  seoTitle: string
  seoDescription: string
  keywords: string
  relatedLinks: string[]
}

/**
 * 产品内容元数据接口
 */
export interface ProductFrontmatter extends BaseFrontmatter {
  category: string
  model: string
  brand: string
  image: string
}

/**
 * 解决方案内容元数据接口
 */
export interface SolutionFrontmatter extends BaseFrontmatter {
  industry: string
  image: string
}

/**
 * 案例内容元数据接口
 */
export interface CaseFrontmatter extends BaseFrontmatter {
  client: string
  industry: string
  location: string
  image: string
}

/**
 * 新闻资讯内容元数据接口
 */
export interface NewsFrontmatter extends BaseFrontmatter {
  author: string
  category: string
  image?: string
  status?: string
  publishAt?: string
}

export interface SelectionGuideFrontmatter extends BaseFrontmatter {
  author: string
  category: string
  tags: string[]
}

/**
 * 内容项接口
 */
export interface ContentItem<T extends BaseFrontmatter> {
  frontmatter: T
  content: string
  html: string
}

/**
 * 获取内容目录的绝对路径
 * @param type 内容类型
 * @returns 目录绝对路径
 */
function getContentDir(type: ContentType): string {
  return path.join(process.cwd(), 'content', type)
}

/**
 * 获取指定目录下所有Markdown文件的文件名
 * @param dir 目录路径
 * @returns 文件名数组（不含.md扩展名）
 */
function getMdFileNames(dir: string): string[] {
  try {
    if (!fs.existsSync(dir)) {
      return []
    }
    return fs.readdirSync(dir)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        // 从文件名中提取slug（去掉日期部分）
        const match = file.match(/^\d{4}-\d{2}-\d{2}(?:-\d{6})?-(.*)\.md$/)
        return match ? match[1] : file.replace(/\.md$/, '')
      })
  } catch (error) {
    console.error(`读取目录失败: ${dir}`, error)
    return []
  }
}

/**
 * 读取单个Markdown文件并解析
 * @param type 内容类型
 * @param slug 文件slug（不含.md扩展名）
 * @returns 解析后的内容项，文件不存在时返回null
 */
export async function getContentBySlug<T extends BaseFrontmatter>(
  type: ContentType,
  slug: string
): Promise<ContentItem<T> | null> {
  try {
    const contentDir = getContentDir(type)
    
    // 解码URL编码的slug
    const decodedSlug = decodeURIComponent(slug)
    
    // 查找包含slug的文件
    const files = fs.readdirSync(contentDir)
    // 先查找格式为 yyyy-mm-dd-slug.md 或 yyyy-mm-dd-hhmmss-slug.md 的文件（新闻）
    let matchingFiles = files.filter(file => file.endsWith(`-${decodedSlug}.md`))
    
    let targetFile: string | undefined
    if (matchingFiles.length > 0) {
      // 如果有多个匹配文件，选择最新的（文件名按日期排序）
      targetFile = matchingFiles.sort((a, b) => b.localeCompare(a))[0]
    } else {
      // 如果没有找到，再查找格式为 slug.md 的文件（产品、解决方案等）
      targetFile = files.find(file => file === `${decodedSlug}.md`)
    }
    
    if (!targetFile) {
      console.warn(`文件不存在: ${type}/${decodedSlug}`)
      return null
    }
    
    const fullPath = path.join(contentDir, targetFile)

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    const processedContent = await remark()
      .use(remarkGfm)
      .use(remarkHtml)
      .process(content)

    const html = processedContent.toString()

    return {
      frontmatter: {
        ...data,
        slug: decodedSlug,
      } as T,
      content,
      html,
    }
  } catch (error) {
    console.error(`解析文件失败: ${type}/${slug}`, error)
    return null
  }
}

/**
 * 获取指定类型的所有内容
 * @param type 内容类型
 * @param sortField 排序字段（默认date）
 * @param sortOrder 排序顺序（desc降序/asc升序，默认desc）
 * @returns 内容项数组
 */
export async function getAllContent<T extends BaseFrontmatter>(
  type: ContentType,
  sortField: keyof BaseFrontmatter = 'date',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<ContentItem<T>[]> {
  try {
    const contentDir = getContentDir(type)
    if (!fs.existsSync(contentDir)) {
      return []
    }
    
    // 获取所有md文件
    const files = fs.readdirSync(contentDir)
      .filter(file => file.endsWith('.md'))
    
    // 直接读取所有文件，不通过slug去重（所有新闻都要展示）
    const items = await Promise.all(
      files.map(file => getContentByFile<T>(type, file))
    )

    const validItems = items.filter((item): item is ContentItem<T> => {
      return item !== null
    })

    return validItems.sort((a, b) => {
      const aVal = a.frontmatter[sortField]
      const bVal = b.frontmatter[sortField]

      if (sortOrder === 'desc') {
        return aVal > bVal ? -1 : 1
      } else {
        return aVal < bVal ? -1 : 1
      }
    })
  } catch (error) {
    console.error(`获取内容列表失败: ${type}`, error)
    return []
  }
}

/**
 * 直接通过文件名读取内容（不通过slug查找）
 * @param type 内容类型
 * @param fileName 文件名
 * @returns 解析后的内容项
 */
async function getContentByFile<T extends BaseFrontmatter>(
  type: ContentType,
  fileName: string
): Promise<ContentItem<T> | null> {
  try {
    const contentDir = getContentDir(type)
    const fullPath = path.join(contentDir, fileName)

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    const processedContent = await remark()
      .use(remarkGfm)
      .use(remarkHtml)
      .process(content)

    const html = processedContent.toString()
    
    // 从文件名中提取slug
    let slug = ''
    const match = fileName.match(/^\d{4}-\d{2}-\d{2}(?:-\d{6})?-(.*)\.md$/)
    if (match) {
      slug = match[1]
    } else {
      slug = fileName.replace(/\.md$/, '')
    }

    return {
      frontmatter: {
        ...data,
        slug,
      } as T,
      content,
      html,
    }
  } catch (error) {
    console.error(`解析文件失败: ${type}/${fileName}`, error)
    return null
  }
}

/**
 * 获取所有内容的slug列表（用于generateStaticParams）
 * @param type 内容类型
 * @returns slug对象数组
 */
export function getAllSlugs(type: ContentType): { slug: string }[] {
  try {
    const contentDir = getContentDir(type)
    const slugs = getMdFileNames(contentDir)
    return slugs.map(slug => ({ slug }))
  } catch (error) {
    console.error(`获取slug列表失败: ${type}`, error)
    return []
  }
}
