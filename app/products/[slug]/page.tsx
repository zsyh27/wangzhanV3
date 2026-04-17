import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import { generateProductJsonLd } from '@/lib/seo'
import {
  getAllContent,
  getAllSlugs,
  getContentBySlug,
  ProductFrontmatter,
  CaseFrontmatter,
  SelectionGuideFrontmatter
} from '@/lib/markdown'

/**
 * 产品详情页 - 生成静态路径
 * SEO优化：构建时预生成所有产品详情页
 */
export function generateStaticParams() {
  return getAllSlugs('products')
}

/**
 * 产品详情页 - 动态生成SEO元数据
 * SEO优化：自动读取Markdown的Frontmatter生成TDK
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const product = await getContentBySlug<ProductFrontmatter>('products', resolvedParams.slug)
  
  if (!product) {
    return {
      title: '产品未找到',
      description: '产品页面不存在'
    }
  }

  return {
    title: product.frontmatter.seoTitle,
    description: product.frontmatter.seoDescription,
    keywords: product.frontmatter.keywords,
  }
}

/**
 * 产品详情页组件
 * SEO优化：单页面1个h1，层级清晰，面包屑导航，相关推荐内链
 */
export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const product = await getContentBySlug<ProductFrontmatter>('products', resolvedParams.slug)
  const allProducts = await getAllContent<ProductFrontmatter>('products')
  const allGuides = await getAllContent<SelectionGuideFrontmatter>('selection-guide')
  const allCases = await getAllContent<CaseFrontmatter>('cases')

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-24">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="font-heading font-bold text-3xl text-text mb-4">产品未找到</h1>
            <p className="text-text-secondary mb-8">您访问的产品页面不存在</p>
            <Link href="/products" className="text-primary hover:underline cursor-pointer">
              返回产品中心
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const breadcrumbItems = [
    { label: '首页', href: '/' },
    { label: '产品中心', href: '/products' },
    { label: product.frontmatter.title }
  ]

  const relatedProducts = allProducts.filter(p => p.frontmatter.slug !== product.frontmatter.slug).slice(0, 3)
  const relatedArticles = allGuides.slice(0, 3)
  const relatedCases = allCases.slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductJsonLd({
            name: product.frontmatter.title,
            seoDescription: product.frontmatter.seoDescription,
            brand: product.frontmatter.brand,
            model: product.frontmatter.model,
            category: product.frontmatter.category,
          })),
        }}
      />
      <Navbar />
      
      <main>
        <Breadcrumb items={breadcrumbItems} />
        
        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-text mb-6">
              {product.frontmatter.title}
            </h1>
            
            <div className="mb-8 flex justify-center">
              <div className="bg-gray-50 rounded-xl p-8 max-w-md w-full">
                {product.frontmatter.image ? (
                  <img 
                    src={product.frontmatter.image} 
                    alt={product.frontmatter.title}
                    className="max-w-full max-h-64 object-contain mx-auto"
                  />
                ) : (
                  <img 
                    src="/images/Honeywell.png" 
                    alt={product.frontmatter.title}
                    className="max-w-full max-h-64 object-contain mx-auto"
                  />
                )}
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6 mb-8">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-text-secondary text-sm mb-1">型号</p>
                  <p className="text-text font-medium">{product.frontmatter.model}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm mb-1">品牌</p>
                  <p className="text-text font-medium">{product.frontmatter.brand}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm mb-1">分类</p>
                  <p className="text-text font-medium">{product.frontmatter.category}</p>
                </div>
              </div>
              <div className="mt-6">
                <Link 
                  href="/contact"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer inline-flex items-center"
                  title={`获取${product.frontmatter.model}报价`}
                >
                  获取{product.frontmatter.model}报价
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            <div 
              className="prose prose-lg max-w-none text-text"
              dangerouslySetInnerHTML={{ __html: product.html }}
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
                    <div className="mb-4">
                      {item.frontmatter.image ? (
                        <div className="w-full h-32 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                          <img 
                            src={item.frontmatter.image} 
                            alt={item.frontmatter.title}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                          <img 
                            src="/images/Honeywell.png" 
                            alt={item.frontmatter.title}
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-text mb-2 text-center">{item.frontmatter.title}</h3>
                    <p className="text-text-secondary text-sm text-center">型号: {item.frontmatter.model}</p>
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
              需要技术选型支持？
            </h2>
            <p className="text-text-secondary text-lg mb-8">
              我们的专业技术团队为您提供免费的阀门选型咨询服务
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
