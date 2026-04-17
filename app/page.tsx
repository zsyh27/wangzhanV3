import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getAllContent, ProductFrontmatter, SelectionGuideFrontmatter } from '@/lib/markdown'

/**
 * 首页SEO元数据配置
 * SEO优化：严格按照百度SEO规范，配置完整TDK
 */
export const metadata: Metadata = {
  title: '霍尼韦尔阀门湖北代理商_V5011B2W选型报价_武汉暖通阀门配套 - 湖北科信达',
  description: '湖北科信达是霍尼韦尔阀门湖北授权代理商，专注武汉及湖北地区中央空调阀门配套，提供V5011B2W、V5GV等全系列产品选型指导、技术参数、价格咨询，服务暖通工程商10年+。',
  keywords: '霍尼韦尔阀门湖北代理商,霍尼韦尔阀门选型,V5011B2W参数,武汉暖通阀门,湖北中央空调阀门配套,霍尼韦尔电动二通阀',
}

/**
 * 首页组件
 * 百度SEO核心权重页，严格按照固定模块顺序
 */
export default async function HomePage() {
  const products = await getAllContent<ProductFrontmatter>('products')
  const guides = await getAllContent<SelectionGuideFrontmatter>('selection-guide')
  const cases = await getAllContent('cases')

  return (
    <>
      <Navbar />
      
      <main>
        {/* Hero Section - 核心关键词突出 */}
        <section className="py-16 md:py-24 bg-cover bg-center relative" style={{ backgroundImage: 'url(/images/home-bg.png)' }}>
          <div className="absolute inset-0 bg-cta/80"></div>
          <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded text-sm font-medium mb-8">
              霍尼韦尔官方授权代理商
            </div>
            <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4 leading-tight">
              霍尼韦尔阀门湖北唯一官方授权代理商
            </h1>
            <h2 className="font-heading font-semibold text-xl md:text-2xl text-white/90 mb-8">
              专业提供霍尼韦尔阀门选型与技术服务
            </h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed">
              湖北科信达是霍尼韦尔阀门湖北授权代理商，专注武汉及湖北地区中央空调阀门配套，提供V5011B2W、V5GV等全系列产品选型指导、技术参数、价格咨询，服务暖通工程商10年+。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="bg-white text-cta hover:bg-gray-100 px-6 py-3 rounded font-semibold transition-colors duration-200 cursor-pointer inline-flex items-center justify-center"
                title="获取霍尼韦尔阀门报价"
              >
                获取报价
              </Link>
              <Link 
                href="/products" 
                className="bg-transparent border border-white text-white hover:bg-white/10 px-6 py-3 rounded font-semibold transition-colors duration-200 cursor-pointer inline-flex items-center justify-center"
                title="浏览霍尼韦尔阀门产品"
              >
                浏览产品
              </Link>
            </div>
          </div>
        </section>

        {/* 核心产品展示 */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading font-semibold text-2xl md:text-3xl text-text mb-4">
                霍尼韦尔阀门核心产品
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                提供V5011B2W、V5011S2W、V5GV、V6GV等全系列霍尼韦尔阀门产品
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 6).map((product, index) => (
                <Link 
                  key={index}
                  href={`/products/${product.frontmatter.slug}`}
                  className="bg-white border border-gray-100 rounded p-6 hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
                  title={`查看${product.frontmatter.title}详情`}
                >
                  <h3 className="font-semibold text-lg text-text mb-4 pb-2 border-b border-gray-100">{product.frontmatter.title}</h3>
                  <div className="space-y-1">
                    <p className="text-text-secondary text-sm">型号: {product.frontmatter.model}</p>
                    <p className="text-primary text-sm mt-2">查看详情 →</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link 
                href="/products"
                className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-cta text-text hover:text-cta px-6 py-3 rounded font-medium transition-colors duration-200 cursor-pointer"
                title="查看全部霍尼韦尔阀门产品"
              >
                查看全部产品
              </Link>
            </div>
          </div>
        </section>

        {/* 技术支持 */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading font-semibold text-2xl md:text-3xl text-text mb-4">
                技术支持与选型指南
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                专业的霍尼韦尔阀门选型指导、安装说明、故障排查
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {guides.slice(0, 3).map((item, index) => (
                <Link 
                  key={index}
                  href={`/selection-guide/${item.frontmatter.slug}`}
                  className="bg-white border border-gray-100 rounded-xl p-6 hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer"
                  title={item.frontmatter.title}
                >
                  <h3 className="font-semibold text-lg text-text mb-2">{item.frontmatter.title}</h3>
                  <p className="text-text-secondary text-sm mb-2">分类：{item.frontmatter.category}</p>
                  <p className="text-primary text-sm">查看详情 →</p>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link 
                href="/selection-guide"
                className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-cta text-text hover:text-cta px-6 py-3 rounded font-medium transition-colors duration-200 cursor-pointer"
                title="查看更多技术支持文章"
              >
                查看更多技术支持
              </Link>
            </div>
          </div>
        </section>

        {/* 成功案例 */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading font-semibold text-2xl md:text-3xl text-text mb-4">
                成功案例
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                霍尼韦尔阀门在湖北区域的实际应用案例
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: '中国大熊猫保护研究中心绵阳基地项目', location: '四川省绵阳市', product: '霍尼韦尔电动二通阀', slug: 'panda-research-center-mianyang', image: '/images/cases/中国大熊猫保护研究中心绵阳基地项目/11.jpg' },
                { name: '鄂州市中心医院', location: '湖北省鄂州市', product: '霍尼韦尔电动二通阀', slug: 'ezhou-central-hospital', image: '/images/cases/鄂州市中心医院/11.jpg' },
                { name: '天创黄金时代消防项目', location: '湖北省武汉市', product: '霍尼韦尔平衡阀', slug: 'tianchuang-golden-age-fire-protection', image: '/images/cases/天创黄金时代消防/11.jpg' },
              ].map((item, index) => (
                <Link 
                  key={index}
                  href={`/cases/${item.slug}`}
                  className="bg-white border border-gray-100 rounded overflow-hidden hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer"
                  title={`查看${item.name}详情`}
                >
                  <div className="relative h-48 bg-slate-50">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg text-text mb-2">{item.name}</h3>
                    <p className="text-text-secondary text-sm mb-1">{item.location}</p>
                    <p className="text-text-secondary text-sm">{item.product}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link 
                href="/cases"
                className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-cta text-text hover:text-cta px-6 py-3 rounded font-medium transition-colors duration-200 cursor-pointer"
                title="查看更多霍尼韦尔阀门工程案例"
              >
                查看更多案例
              </Link>
            </div>
          </div>
        </section>

        {/* 公司优势 */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-heading font-semibold text-2xl md:text-3xl text-text text-center mb-12">
              为什么选择湖北科信达
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-50 rounded-xl p-8">
                <h3 className="font-semibold text-xl text-text mb-6">核心服务优势</h3>
                <ul className="space-y-4 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="text-cta text-xl">✓</span>
                    <span>100%正品霍尼韦尔阀门，官方授权保障</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cta text-xl">✓</span>
                    <span>专业技术选型支持，资深工程师团队</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cta text-xl">✓</span>
                    <span>湖北本地化快速响应服务</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cta text-xl">✓</span>
                    <span>完善的售后保障体系</span>
                  </li>
                </ul>
              </div>
              <div className="bg-slate-50 rounded-xl p-8">
                <h3 className="font-semibold text-xl text-text mb-6">霍尼韦尔代理资质</h3>
                <div className="relative w-full h-80">
                  <Image
                    src="/images/about/霍尼韦尔资质.png"
                    alt="霍尼韦尔授权证书"
                    fill
                    className="object-contain"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA转化入口 */}
        <section className="py-16 bg-cta">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-heading font-semibold text-2xl md:text-3xl text-white mb-4">
              需要霍尼韦尔阀门选型支持？
            </h2>
            <p className="text-white/80 text-lg mb-8">
              联系我们获取免费的阀门选型咨询服务
            </p>
            <Link 
              href="/contact"
              className="bg-white hover:bg-gray-100 text-cta px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 cursor-pointer inline-flex items-center"
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
