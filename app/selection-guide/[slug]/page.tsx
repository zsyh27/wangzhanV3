import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import { generateFaqJsonLd } from '@/lib/seo'
import {
  getAllContent,
  getAllSlugs,
  getContentBySlug,
  SolutionFrontmatter,
  ProductFrontmatter,
  CaseFrontmatter,
  SelectionGuideFrontmatter
} from '@/lib/markdown'

/**
 * 选型指南详情页 - 生成静态路径
 * SEO优化：构建时预生成所有选型指南详情页
 */
export function generateStaticParams() {
  return getAllSlugs('selection-guide')
}

/**
 * 选型指南详情页 - 动态生成SEO元数据
 * SEO优化：自动读取Markdown的Frontmatter生成TDK
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const guide = await getContentBySlug<SelectionGuideFrontmatter>('selection-guide', resolvedParams.slug)
  
  if (!guide) {
    return {
      title: '选型指南未找到',
      description: '选型指南页面不存在'
    }
  }

  return {
    title: guide.frontmatter.seoTitle,
    description: guide.frontmatter.seoDescription,
    keywords: guide.frontmatter.keywords,
  }
}

/**
 * 选型指南详情页组件
 * SEO优化：单页面1个h1，层级清晰，面包屑导航，相关推荐内链
 */
export default async function SelectionGuideDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const guide = await getContentBySlug<SelectionGuideFrontmatter>('selection-guide', resolvedParams.slug)
  const allProducts = await getAllContent<ProductFrontmatter>('products')
  const allGuides = await getAllContent<SelectionGuideFrontmatter>('selection-guide')
  const allCases = await getAllContent<CaseFrontmatter>('cases')

  if (!guide) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-24">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="font-heading font-bold text-3xl text-text mb-4">选型指南未找到</h1>
            <p className="text-text-secondary mb-8">您访问的选型指南页面不存在</p>
            <Link href="/selection-guide" className="text-primary hover:underline cursor-pointer">
              返回选型指南
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const breadcrumbItems = [
    { label: '首页', href: '/' },
    { label: '技术支持', href: '/selection-guide' },
    { label: guide.frontmatter.title }
  ]

  const relatedProducts = allProducts.slice(0, 3)
  const relatedArticles = allGuides.filter(g => g.frontmatter.slug !== guide.frontmatter.slug).slice(0, 3)
  const relatedCases = allCases.slice(0, 3)

  const parseFaqs = (content: string): Array<{ question: string, answer: string }> => {
    const faqs: Array<{ question: string, answer: string }> = []
    const lines = content.split('\n')
    let currentQ = ''
    let currentA = ''
    let inFAQSection = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('## 常见问题') || line.startsWith('## 四、常见问题') || line.startsWith('## 六、常见问题')) {
        inFAQSection = true
        continue
      }
      if (inFAQSection && line.startsWith('## ')) {
        inFAQSection = false
      }
      if (inFAQSection && (line.startsWith('**Q') || line.startsWith('Q:'))) {
        if (currentQ) {
          faqs.push({ question: currentQ, answer: currentA.trim() })
        }
        const qMatch = line.match(/\*\*Q\d*:?\s*(.+?)\*\*/)
        if (qMatch) {
          currentQ = qMatch[1]
        } else if (line.startsWith('Q:')) {
          currentQ = line.replace(/^Q:\s*/, '')
        } else {
          currentQ = line.replace(/\*\*Q\d*:?\s*/, '').replace(/\*\*/g, '')
        }
        currentA = ''
      } else if (inFAQSection && currentQ && line.startsWith('A:')) {
        currentA += line.replace(/^A:\s*/, '') + ' '
      } else if (inFAQSection && currentQ && !line.startsWith('---') && line !== '') {
        currentA += line + ' '
      }
    }
    if (currentQ) {
      faqs.push({ question: currentQ, answer: currentA.trim() })
    }
    return faqs
  }

  const faqs = parseFaqs(guide.content)

  return (
    <>
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateFaqJsonLd(faqs)),
          }}
        />
      )}
      <Navbar />
      
      <main>
        <Breadcrumb items={breadcrumbItems} />
        
        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-text mb-6">
              {guide.frontmatter.title}
            </h1>
            
            <div className="bg-slate-50 rounded-xl p-6 mb-8">
              <p className="text-text text-lg">分类：{guide.frontmatter.category}</p>
              <div className="mt-6">
                <Link 
                  href="/contact"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer inline-flex items-center"
                  title="获取专业选型指导"
                >
                  咨询技术工程师
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            <div 
              className="prose prose-lg max-w-none text-text"
              dangerouslySetInnerHTML={{ __html: guide.html }}
            />
          </div>
        </section>

        {relatedArticles.length > 0 && (
          <section className="py-16 bg-slate-50">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
                相关文章
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedArticles.map((item, index) => (
                  <Link 
                    key={index}
                    href={`/selection-guide/${item.frontmatter.slug}`}
                    className="bg-background border border-gray-100 rounded-xl p-6 hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer"
                    title={`${item.frontmatter.title}选型指南`}
                  >
                    <h3 className="font-semibold text-lg text-text mb-2">{item.frontmatter.title}</h3>
                    <p className="text-text-secondary text-sm mb-2">分类：{item.frontmatter.category}</p>
                    <p className="text-primary text-sm">查看详情 →</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {relatedProducts.length > 0 && (
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
                相关产品
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedProducts.map((item, index) => (
                  <Link 
                    key={index}
                    href={`/products/${item.frontmatter.slug}`}
                    className="bg-background border border-gray-100 rounded-xl p-6 hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer"
                    title={`${item.frontmatter.title}产品详情`}
                  >
                    <h3 className="font-semibold text-lg text-text mb-2">{item.frontmatter.title}</h3>
                    <p className="text-text-secondary text-sm">{item.frontmatter.model}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {relatedCases.length > 0 && (
          <section className="py-16 bg-slate-50">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
                相关案例推荐
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedCases.map((item, index) => (
                  <Link 
                    key={index}
                    href={`/cases/${item.frontmatter.slug}`}
                    className="bg-background border border-gray-100 rounded-xl p-6 hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer"
                    title={`${item.frontmatter.title}案例详情`}
                  >
                    <h3 className="font-semibold text-lg text-text mb-2">{item.frontmatter.title}</h3>
                    <p className="text-text-secondary text-sm">{item.frontmatter.location}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-heading font-semibold text-2xl text-text mb-4">
              需要专业选型指导？
            </h2>
            <p className="text-text-secondary text-lg mb-8">
              我们的技术工程师为您提供免费的选型咨询服务
            </p>
            <Link 
              href="/contact"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 cursor-pointer inline-flex items-center"
              title="联系我们获取选型指导"
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
