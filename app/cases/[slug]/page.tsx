import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import {
  getAllContent,
  getAllSlugs,
  getContentBySlug,
  CaseFrontmatter,
  ProductFrontmatter
} from '@/lib/markdown'

/**
 * 案例详情页 - 生成静态路径
 * SEO优化：构建时预生成所有案例详情页
 */
export function generateStaticParams() {
  return getAllSlugs('cases')
}

/**
 * 案例详情页 - 动态生成SEO元数据
 * SEO优化：自动读取Markdown的Frontmatter生成TDK
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const caseItem = await getContentBySlug<CaseFrontmatter>('cases', resolvedParams.slug)
  
  if (!caseItem) {
    return {
      title: '案例未找到',
      description: '案例页面不存在'
    }
  }

  return {
    title: caseItem.frontmatter.seoTitle,
    description: caseItem.frontmatter.seoDescription,
    keywords: caseItem.frontmatter.keywords,
  }
}

/**
 * 案例详情页组件
 * SEO优化：单页面1个h1，层级清晰，面包屑导航，相关推荐内链
 */
export default async function CaseDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const caseItem = await getContentBySlug<CaseFrontmatter>('cases', resolvedParams.slug)
  const allProducts = await getAllContent<ProductFrontmatter>('products')
  const allCases = await getAllContent<CaseFrontmatter>('cases')

  if (!caseItem) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-24">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="font-heading font-bold text-3xl text-text mb-4">案例未找到</h1>
            <p className="text-text-secondary mb-8">您访问的案例页面不存在</p>
            <Link href="/cases" className="text-primary hover:underline cursor-pointer">
              返回案例中心
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const breadcrumbItems = [
    { label: '首页', href: '/' },
    { label: '案例中心', href: '/cases' },
    { label: caseItem.frontmatter.title }
  ]

  const relatedProducts = allProducts.slice(0, 3)
  const relatedCases = allCases.filter(c => c.frontmatter.slug !== caseItem.frontmatter.slug).slice(0, 3)

  return (
    <>
      <Navbar />
      
      <main>
        <Breadcrumb items={breadcrumbItems} />
        
        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-text mb-6">
              {caseItem.frontmatter.title}
            </h1>
            
            <div className="bg-slate-50 rounded-xl p-6 mb-8">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-text-secondary text-sm mb-1">客户</p>
                  <p className="text-text font-medium">{caseItem.frontmatter.client}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm mb-1">行业</p>
                  <p className="text-text font-medium">{caseItem.frontmatter.industry}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm mb-1">区域</p>
                  <p className="text-text font-medium">{caseItem.frontmatter.location}</p>
                </div>
              </div>
              <div className="mt-6">
                <Link 
                  href="/selection-guide"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer inline-flex items-center"
                  title="查看类似项目方案"
                >
                  查看类似项目方案
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            <div 
              className="prose prose-lg max-w-none text-text"
              dangerouslySetInnerHTML={{ __html: caseItem.html }}
            />
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="py-16 bg-slate-50">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
                使用产品
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
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
                相关案例
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
                    <p className="text-text-secondary text-sm mb-2">行业：{item.frontmatter.industry}</p>
                    <p className="text-text-secondary text-sm">{item.frontmatter.location}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-heading font-semibold text-2xl text-text mb-4">
              想了解更多成功案例？
            </h2>
            <p className="text-text-secondary text-lg mb-8">
              联系我们，获取更多湖北本地项目案例
            </p>
            <Link 
              href="/contact"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 cursor-pointer inline-flex items-center"
              title="联系我们咨询项目合作"
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
