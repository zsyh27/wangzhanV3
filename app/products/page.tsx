import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getAllContent, ProductFrontmatter } from '@/lib/markdown'

/**
 * 产品中心列表页SEO元数据配置
 * SEO优化：产品品类词、品牌区域词排名，内链枢纽页
 */
export const metadata: Metadata = {
  title: '霍尼韦尔中央空调阀门_V5011B2W_V5GV系列选型参数 - 湖北科信达',
  description: '霍尼韦尔阀门全系列产品：V5011B2W螺纹二通阀、V5GV法兰阀、电动球阀、电动蝶阀，提供详细技术参数、选型指导、价格咨询，湖北现货供应。',
  keywords: 'V5011B2W,V5GV,霍尼韦尔电动阀选型,中央空调阀门参数,湖北阀门供应商',
}

/**
 * 产品中心列表页
 * SEO优化：内链枢纽页，自动读取Markdown文件生成内容
 */
export default async function ProductsPage() {
  const products = await getAllContent<ProductFrontmatter>('products')

  return (
    <>
      <Navbar />
      
      <main>
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-text mb-6 text-center">
              霍尼韦尔中央空调阀门产品中心
            </h1>
            <p className="text-text-secondary text-lg text-center max-w-3xl mx-auto">
              湖北科信达作为霍尼韦尔阀门湖北官方授权代理商，提供全系列霍尼韦尔中央空调阀门产品，包括电动二通阀、三通阀、平衡阀、蒸汽阀等，正品保障，专业选型配套服务
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
              产品列表
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <Link 
                  key={index}
                  href={`/products/${product.frontmatter.slug}`}
                  className="bg-white border border-gray-100 rounded-xl p-6 hover:border-primary/20 hover:shadow-md transition-all duration-200"
                  title={product.frontmatter.title}
                >
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                      <img 
                        src="/images/Honeywell.png" 
                        alt={product.frontmatter.title}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg text-text mb-4 text-center">{product.frontmatter.title}</h3>
                  <div className="text-center">
                    <p className="text-primary text-sm">查看详情 →</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
              产品样册下载
            </h2>
            <div className="bg-white rounded-xl p-8 border border-gray-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-text mb-2">霍尼韦尔暖通空调电动阀与执行器综合样册</h3>
                  <p className="text-text-secondary mb-4">包含全系列霍尼韦尔电动阀门产品的详细技术参数、安装说明和选型指南</p>
                  <ul className="space-y-2 text-text-secondary text-sm mb-6">
                    <li>• 电动座阀和执行器系列</li>
                    <li>• 电动球阀和执行器系列</li>
                    <li>• 电动蝶阀和执行器系列</li>
                    <li>• 技术参数和选型表</li>
                    <li>• 安装和维护指南</li>
                  </ul>
                </div>
                <div className="flex-shrink-0">
                  <a 
                    href="/products/霍尼韦尔暖通空调电动阀与执行器综合样册 20250421-2.pdf"
                    download
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200 cursor-pointer inline-flex items-center gap-2"
                    title="下载霍尼韦尔阀门产品样册"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    下载样册
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

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
