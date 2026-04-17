import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getAllContent, SelectionGuideFrontmatter } from '@/lib/markdown'

/**
 * 技术支持列表页SEO元数据配置
 * SEO优化：选型需求词、区域长尾词排名，内链枢纽页
 */
export const metadata: Metadata = {
  title: '霍尼韦尔阀门技术支持_V5011B2W_V5GV选型参数 - 湖北科信达',
  description: '湖北科信达提供霍尼韦尔阀门技术支持，包括V5011B2W、V5GV等全系列产品技术参数、选型建议、安装指导，帮助工程商快速选型。',
  keywords: '霍尼韦尔阀门技术支持,V5011B2W选型,V5GV选型,电动阀选型指南,湖北阀门选型',
}

/**
 * 技术支持列表页
 * SEO优化：内链枢纽页，自动读取Markdown文件生成内容
 */
export default async function SelectionGuidePage() {
  const guides = await getAllContent<SelectionGuideFrontmatter>('selection-guide')

  return (
    <>
      <Navbar />
      
      <main>
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-text mb-6 text-center">
              技术支持
            </h1>
            <p className="text-text-secondary text-lg text-center max-w-3xl mx-auto">
              湖北科信达为您提供专业的霍尼韦尔阀门技术支持，帮助工程商快速找到适合的产品
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
              技术文章
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide, index) => (
                <Link 
                  key={index}
                  href={`/selection-guide/${guide.frontmatter.slug}`}
                  className="bg-background border border-gray-100 rounded-xl p-6 hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer"
                  title={`${guide.frontmatter.title}技术文章`}
                >
                  <h3 className="font-semibold text-lg text-text mb-4">{guide.frontmatter.title}</h3>
                  <p className="text-primary text-sm">查看详情 →</p>
                </Link>
              ))}
              {guides.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-text-secondary">技术文章内容更新中，敬请期待...</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-50">
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
