import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import {
  getAllContent,
  getAllSlugs,
  getContentBySlug,
  NewsFrontmatter,
  ProductFrontmatter,
  SolutionFrontmatter
} from '@/lib/markdown'

/**
 * 格式化日期为中文格式
 * @param dateString ISO格式的日期字符串
 * @returns 中文格式的日期字符串，如：2026年4月7日 08:30:45
 */
function formatDateToChinese(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`
}

/**
 * 文章详情页 - 生成静态路径
 * SEO优化：构建时预生成所有文章详情页
 */
export function generateStaticParams() {
  return getAllSlugs('news')
}

/**
 * 文章详情页 - 动态生成SEO元数据
 * SEO优化：自动读取Markdown的Frontmatter生成TDK
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const newsItem = await getContentBySlug<NewsFrontmatter>('news', resolvedParams.slug)
  
  if (!newsItem) {
    return {
      title: '文章未找到',
      description: '文章页面不存在'
    }
  }

  return {
    title: newsItem.frontmatter.seoTitle,
    description: newsItem.frontmatter.seoDescription,
    keywords: newsItem.frontmatter.keywords,
  }
}

/**
 * 文章详情页组件
 * SEO优化：单页面1个h1，层级清晰，面包屑导航，相关推荐内链，上下篇导航
 */
export default async function NewsDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const newsItem = await getContentBySlug<NewsFrontmatter>('news', resolvedParams.slug)
  const allNews = await getAllContent<NewsFrontmatter>('news')
  const allProducts = await getAllContent<ProductFrontmatter>('products')
  const allSolutions = await getAllContent<SolutionFrontmatter>('solutions')

  if (!newsItem) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-24">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="font-heading font-bold text-3xl text-text mb-4">文章未找到</h1>
            <p className="text-text-secondary mb-8">您访问的文章页面不存在</p>
            <Link href="/news" className="text-primary hover:underline cursor-pointer">
              返回新闻资讯
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const breadcrumbItems = [
    { label: '首页', href: '/' },
    { label: '新闻资讯', href: '/news' },
    { label: newsItem.frontmatter.title }
  ]

  const currentIndex = allNews.findIndex(item => item.frontmatter.slug === resolvedParams.slug)
  const prevNews = currentIndex > 0 ? allNews[currentIndex - 1] : null
  const nextNews = currentIndex < allNews.length - 1 ? allNews[currentIndex + 1] : null

  const relatedItems = [
    ...allProducts.slice(0, 2),
    ...allSolutions.slice(0, 2)
  ]

  return (
    <>
      <Navbar />
      
      <main>
        <Breadcrumb items={breadcrumbItems} />
        
        <section className="py-8 md:py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-text mb-6">
              {newsItem.frontmatter.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-8 text-text-secondary text-sm">
              <span>发布时间：{formatDateToChinese(String(newsItem.frontmatter.date))}</span>
              <span>•</span>
              <span>作者：{newsItem.frontmatter.author}</span>
              <span>•</span>
              <span>分类：{newsItem.frontmatter.category}</span>
            </div>
          </div>
        </section>

        <section className="py-8 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            <div 
              className="prose prose-lg max-w-none text-text prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto prose-img:my-8 prose-headings:text-primary prose-p:leading-relaxed prose-ul:space-y-2 prose-ol:space-y-2 prose-p:text-justify prose-p:indent-4 [&_h1]:text-center [&_h2]:text-center [&_h3]:text-center"
              dangerouslySetInnerHTML={{ __html: newsItem.html }}
            />
          </div>
        </section>

        {(prevNews || nextNews) && (
          <section className="py-16 bg-slate-50">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
                更多文章
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {prevNews && (
                  <Link 
                    href={`/news/${prevNews.frontmatter.slug}`}
                    className="bg-background border border-gray-100 rounded-xl p-6 hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer"
                    title={`上一篇：${prevNews.frontmatter.title}`}
                  >
                    <p className="text-text-secondary text-sm mb-2">← 上一篇</p>
                    <h3 className="font-semibold text-lg text-text">{prevNews.frontmatter.title}</h3>
                  </Link>
                )}
                {nextNews && (
                  <Link 
                    href={`/news/${nextNews.frontmatter.slug}`}
                    className={`bg-background border border-gray-100 rounded-xl p-6 hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer ${prevNews ? '' : 'md:col-start-2'}`}
                    title={`下一篇：${nextNews.frontmatter.title}`}
                  >
                    <p className="text-text-secondary text-sm mb-2 text-right">下一篇 →</p>
                    <h3 className="font-semibold text-lg text-text">{nextNews.frontmatter.title}</h3>
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {relatedItems.length > 0 && (
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
                相关推荐
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedItems.slice(0, 4).map((item, index) => {
                  const isProduct = 'category' in item.frontmatter && 'model' in item.frontmatter
                  const href = isProduct 
                    ? `/products/${item.frontmatter.slug}`
                    : `/solutions/${item.frontmatter.slug}`
                  
                  return (
                    <Link 
                      key={index}
                      href={href}
                      className="bg-background border border-gray-100 rounded-xl p-6 hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer"
                      title={item.frontmatter.title}
                    >
                      <h3 className="font-semibold text-lg text-text mb-2">{item.frontmatter.title}</h3>
                      <p className="text-text-secondary text-sm">
                        {isProduct ? '产品' : '方案'}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        <section className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-heading font-semibold text-2xl text-text mb-4">
              想了解更多？
            </h2>
            <p className="text-text-secondary text-lg mb-8">
              联系我们的专业技术团队，获取一对一的咨询服务
            </p>
            <Link 
              href="/contact"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 cursor-pointer inline-flex items-center"
              title="联系我们获取技术支持"
            >
              立即咨询
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}