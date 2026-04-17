'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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
 * 新闻列表客户端组件
 */
export default function NewsList({ news }: { news: any[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const itemsPerPage = 10
  const currentPage = parseInt(searchParams.get('page') || '1')
  const currentCategory = searchParams.get('category') || ''
  
  // 按分类筛选新闻
  let filteredNews = news
  if (currentCategory) {
    filteredNews = news.filter(item => item.frontmatter.category === currentCategory)
  }
  
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedNews = filteredNews.slice(startIndex, endIndex)
  
  // 获取所有分类
  const allCategories = Array.from(new Set(news.map(item => item.frontmatter.category)))

  return (
    <>
      <Navbar />
      
      <main>
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-text mb-6 text-center">
              暖通行业资讯与技术干货
            </h1>
            <p className="text-text-secondary text-lg text-center max-w-3xl mx-auto">
              湖北科信达为您提供暖通行业最新资讯、霍尼韦尔阀门技术干货、中央空调阀门选型技巧、安装维保指南，专业内容持续更新
            </p>
          </div>
        </section>

        <section className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
              最新文章
            </h2>
            
            {/* 分类筛选 */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <button
                onClick={() => router.push('/news')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !currentCategory
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-200 text-text hover:border-primary hover:text-primary'
                }`}
                title="查看全部文章"
              >
                全部
              </button>
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => router.push(`/news?category=${encodeURIComponent(category)}`)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    currentCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-white border border-gray-200 text-text hover:border-primary hover:text-primary'
                  }`}
                  title={`查看${category}类文章`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="space-y-6">
              {paginatedNews.map((item, index) => (
                <Link 
                  key={index}
                  href={`/news/${item.frontmatter.slug}`}
                  className="bg-background border border-gray-100 rounded-xl p-6 hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer block"
                  title={item.frontmatter.title}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg text-text mb-2">{item.frontmatter.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                        <span>{formatDateToChinese(String(item.frontmatter.date))}</span>
                        <span>•</span>
                        <span>{item.frontmatter.category}</span>
                        <span>•</span>
                        <span>{item.frontmatter.author}</span>
                      </div>
                    </div>
                    <span className="text-primary text-sm whitespace-nowrap">查看详情 →</span>
                  </div>
                </Link>
              ))}
              {paginatedNews.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-text-secondary">文章内容更新中，敬请期待...</p>
                </div>
              )}
            </div>
            
            {/* 分页组件 */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const params = new URLSearchParams()
                    params.set('page', String(page))
                    if (currentCategory) {
                      params.set('category', currentCategory)
                    }
                    return (
                      <Link
                        key={page}
                        href={`/news?${params.toString()}`}
                        className={`px-4 py-2 rounded-md ${page === currentPage ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-text hover:border-primary hover:text-primary'}`}
                        title={`第${page}页`}
                      >
                        {page}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-heading font-semibold text-2xl text-text mb-4">
              需要更多技术支持？
            </h2>
            <p className="text-text-secondary text-lg mb-8">
              我们的专业技术团队为您提供一对一的技术咨询服务
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
