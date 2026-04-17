import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getAllContent, CaseFrontmatter } from '@/lib/markdown'

/**
 * 案例中心列表页SEO元数据配置
 * SEO优化：湖北本地项目词、口碑词排名，信任背书页
 */
export const metadata: Metadata = {
  title: '暖通阀门项目案例_霍尼韦尔阀门湖北落地案例_湖北科信达机电设备有限公司',
  description: '湖北科信达机电设备有限公司霍尼韦尔阀门湖北本地落地案例，覆盖武汉及湖北区域商业综合体、酒店、医院、工业厂房等场景，真实项目效果展示。',
  keywords: '武汉暖通阀门案例,湖北霍尼韦尔阀门项目,中央空调阀门落地案例',
}

/**
 * 案例中心列表页
 * SEO优化：信任背书页，自动读取Markdown文件生成内容
 */
export default async function CasesPage() {
  const cases = await getAllContent<CaseFrontmatter>('cases')

  return (
    <>
      <Navbar />
      
      <main>
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-text mb-6 text-center">
              暖通阀门项目案例
            </h1>
            <p className="text-text-secondary text-lg text-center max-w-3xl mx-auto">
              湖北科信达霍尼韦尔阀门湖北本地落地案例，覆盖武汉及湖北区域商业综合体、酒店、医院、工业厂房等场景，真实项目效果展示
            </p>
          </div>
        </section>

        <section className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
              案例列表
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: '中国大熊猫保护研究中心绵阳基地项目', location: '四川省绵阳市', product: '霍尼韦尔电动二通阀 麦克维尔冷水主机', industry: '科研机构', image: '/images/cases/中国大熊猫保护研究中心绵阳基地项目/11.jpg', slug: 'panda-research-center-mianyang', hasDetail: true },
                { name: '鄂州市中心医院', location: '湖北省鄂州市', product: '霍尼韦尔电动二通阀 暖通系统', industry: '医疗', image: '/images/cases/鄂州市中心医院/11.jpg', slug: 'ezhou-central-hospital', hasDetail: true },
                { name: '天创黄金时代消防项目', location: '湖北省武汉市', product: '霍尼韦尔平衡阀 消防系统', industry: '房地产', image: '/images/cases/天创黄金时代消防/11.jpg', slug: 'tianchuang-golden-age-fire-protection', hasDetail: true },
                { name: '中南医院', location: '湖北省武汉市', product: '霍尼韦尔电动二通阀 暖通系统', industry: '医疗', image: '/images/cases/更多案例/中南医院.jpg', slug: '', hasDetail: false },
                { name: '庙山光电子产业园', location: '湖北省武汉市', product: '霍尼韦尔电动二通阀 工业系统', industry: '工业/科技', image: '/images/cases/更多案例/庙山光电子产业园.jpg', slug: '', hasDetail: false },
                { name: '武汉人民医院洪山院区', location: '湖北省武汉市', product: '霍尼韦尔电动二通阀 暖通系统', industry: '医疗', image: '/images/cases/更多案例/武汉人民医院洪山院区.jpg', slug: '', hasDetail: false },
                { name: '武汉市江汉湾全民健身中心', location: '湖北省武汉市', product: '霍尼韦尔电动二通阀 暖通系统', industry: '体育/公共设施', image: '/images/cases/更多案例/武汉市江汉湾全民健身中心.jpg', slug: '', hasDetail: false },
                { name: '汉阳市政科研中心', location: '湖北省武汉市', product: '霍尼韦尔电动二通阀 暖通系统', industry: '科研/市政', image: '/images/cases/更多案例/汉阳市政科研中心.jpg', slug: '', hasDetail: false },
                { name: '洪湖市人民医院', location: '湖北省洪湖市', product: '霍尼韦尔电动二通阀 暖通系统', industry: '医疗', image: '/images/cases/更多案例/洪湖市人民医院.jpg', slug: '', hasDetail: false }
              ].map((item, index) => (
                item.hasDetail ? (
                  <Link 
                    key={index}
                    href={`/cases/${item.slug}`}
                    className="bg-background border border-gray-100 rounded-xl overflow-hidden hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer"
                    title={`查看${item.name}详情`}
                  >
                    <div className="relative h-48 bg-slate-50">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg text-text mb-2">{item.name}</h3>
                      <p className="text-text-secondary text-sm mb-1">区域：{item.location}</p>
                      <p className="text-text-secondary text-sm mb-1">行业：{item.industry}</p>
                      <p className="text-text-secondary text-sm">产品：{item.product}</p>
                      <p className="text-primary text-sm mt-2">查看详情 →</p>
                    </div>
                  </Link>
                ) : (
                  <div 
                    key={index}
                    className="bg-background border border-gray-100 rounded-xl overflow-hidden hover:border-primary/20 hover:shadow-md transition-all duration-200"
                  >
                    <div className="relative h-48 bg-slate-50">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg text-text mb-2">{item.name}</h3>
                      <p className="text-text-secondary text-sm mb-1">区域：{item.location}</p>
                      <p className="text-text-secondary text-sm mb-1">行业：{item.industry}</p>
                      <p className="text-text-secondary text-sm">产品：{item.product}</p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-heading font-semibold text-2xl text-text mb-4">
              成为下一个成功案例？
            </h2>
            <p className="text-text-secondary text-lg mb-8">
              联系我们，让湖北科信达为您的项目提供专业的霍尼韦尔阀门解决方案
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