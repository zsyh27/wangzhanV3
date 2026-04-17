import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CertificateGallery from '@/components/CertificateGallery'
import HoneywellCertificates from '@/components/HoneywellCertificates'
import { generateFaqJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo'

/**
 * 联系我们页面SEO元数据配置
 * SEO优化：转化收口页，联系方式完整展示
 */
export const metadata: Metadata = {
  title: '联系我们_霍尼韦尔阀门湖北授权代理商_湖北科信达机电设备有限公司',
  description: '湖北科信达机电设备有限公司是霍尼韦尔阀门湖北官方授权代理商，提供武汉及湖北区域霍尼韦尔阀门供应、选型配套、技术咨询服务。咨询热线：13907117179',
  keywords: '霍尼韦尔阀门湖北代理商,武汉暖通阀门,湖北科信达联系方式,霍尼韦尔阀门咨询,霍尼韦尔电动二通阀报价',
}

const certificates = [
  {
    src: '/images/about/certificate-1775611461807-954.jpg',
    alt: '建筑机电安装工程专业承包壹级',
    title: '建筑机电安装工程专业承包壹级'
  },
  {
    src: '/images/about/certificate-1775611461810-184.jpg',
    alt: '消防设施工程专业承包壹级',
    title: '消防设施工程专业承包壹级'
  },
  {
    src: '/images/about/certificate-1775611461817-646.jpg',
    alt: '机电工程施工总承包贰级',
    title: '机电工程施工总承包贰级'
  },
  {
    src: '/images/about/certificate-1775611461820-706.jpg',
    alt: '电子与智能化工程专业承包贰级',
    title: '电子与智能化工程专业承包贰级'
  },
  {
    src: '/images/about/certificate-1775611461827-577.jpg',
    alt: '中国制冷空调设备维修改造企业贰级',
    title: '中国制冷空调设备维修改造企业贰级'
  },
  {
    src: '/images/about/certificate-1775611461829-862.jpg',
    alt: '建筑施工安全生产许可证',
    title: '建筑施工安全生产许可证'
  },
  {
    src: '/images/about/certificate-1775611461836-461.png',
    alt: '质量管理体系认证',
    title: '质量管理体系认证'
  },
  {
    src: '/images/about/certificate-1775611461839-353.jpg',
    alt: '环境管理体系认证',
    title: '环境管理体系认证'
  },
  {
    src: '/images/about/certificate-1775611461842-784.jpg',
    alt: '职业健康安全管理体系认证',
    title: '职业健康安全管理体系认证'
  },
  {
    src: '/images/about/certificate-1775611461845-389.png',
    alt: 'GC2级压力管道安装资质',
    title: 'GC2级压力管道安装资质'
  },
  {
    src: '/images/about/certificate-1775611461850-702.jpg',
    alt: '高新技术企业证书',
    title: '高新技术企业证书'
  }
]

// FAQ数据
const faqs = [
  {
    question: '霍尼韦尔阀门湖北代理商是哪家公司？',
    answer: '湖北科信达机电设备有限公司是霍尼韦尔阀门湖北官方授权代理商，成立于2011年，专注武汉及湖北区域中央空调阀门供应、选型配套、暖通工程施工。'
  },
  {
    question: '如何获取霍尼韦尔阀门选型指导？',
    answer: '您可以通过电话139-0711-7179、微信或在线表单联系我们的技术工程师，我们将根据您的项目需求提供免费的阀门选型咨询服务。'
  },
  {
    question: '霍尼韦尔阀门价格是多少？',
    answer: '霍尼韦尔阀门价格根据型号、口径、数量等因素有所不同。请联系我们获取详细的产品报价单，大项目可享受优惠价格。'
  },
  {
    question: '是否提供安装调试服务？',
    answer: '是的，我们提供专业的安装指导、调试服务和技术培训，确保阀门系统正常运行。湖北地区可提供上门服务。'
  },
  {
    question: '备件供应有保障吗？',
    answer: '湖北科信达保持充足的霍尼韦尔阀门备件库存，可以快速响应备件需求，确保您的设备正常运行。'
  }
]

// 面包屑数据
const breadcrumbs = [
  { name: '首页', item: 'http://www.hubeikexinda.online/' },
  { name: '联系我们', item: 'http://www.hubeikexinda.online/contact' }
]

/**
 * 联系我们页面
 * SEO优化：转化收口页，联系方式完整展示，整合关于我们内容
 */
export default function ContactPage() {
  return (
    <>
      <Navbar />
      
      <main>
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-text mb-6 text-center">
              关于我们 & 联系我们
            </h1>
            <p className="text-text-secondary text-lg text-center max-w-3xl mx-auto">
              湖北科信达作为霍尼韦尔阀门湖北官方授权代理商，为您提供专业的技术支持和服务
            </p>
          </div>
        </section>

        <section className="py-4 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-background rounded-xl p-8 border border-gray-100">
              <p className="text-text-secondary text-base leading-relaxed mb-6" style={{ textIndent: '2em' }}>
                湖北科信达机电设备有限公司成立于2011年，扎根于"九省通衢"江城武汉，是霍尼韦尔（Honeywell）阀门湖北官方授权代理商，主要从事机电设备、暖通设备的销售以及暖通工程、消防工程、装饰装修工程、水电工程、智能化工程的安装施工、维修及技术咨询服务。
              </p>
              <p className="text-text-secondary text-base leading-relaxed mb-6" style={{ textIndent: '2em' }}>
                公司先后获得了"建筑机电安装工程专业承包壹级"、"消防设施工程专业承包壹级"、"建筑装修装饰工程专业承包贰级"、"建筑业企业施工劳务备案证书"、"机电工程施工总承包贰级"、"电子与智能化工程专业承包贰级"、"中国制冷空调设备维修改造企业贰级"等资格证书，并通过"质量管理体系认证"、"环境管理体系认证"、"职业健康安全管理体系认证"。
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
              霍尼韦尔官方代理资质
            </h2>
            <HoneywellCertificates />
          </div>
        </section>

        <section className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
              企业资质证书
            </h2>
            
            <div className="mb-12">
              <div className="bg-white rounded-xl p-8 border border-gray-100">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <span className="text-text font-medium">消防设施工程专业承包壹级</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <span className="text-text font-medium">建筑机电安装工程专业承包壹级</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <span className="text-text font-medium">中国制冷空调设备维修改造企业壹级</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">4</span>
                    </div>
                    <span className="text-text font-medium">建筑装修装饰工程专业承包贰级</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">5</span>
                    </div>
                    <span className="text-text font-medium">机电工程施工总承包贰级</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">6</span>
                    </div>
                    <span className="text-text font-medium">电子与智能化工程专业承包贰级</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">7</span>
                    </div>
                    <span className="text-text font-medium">高新技术企业</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">8</span>
                    </div>
                    <span className="text-text font-medium">安全生产许可证</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">9</span>
                    </div>
                    <span className="text-text font-medium">质量管理体系认证</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">10</span>
                    </div>
                    <span className="text-text font-medium">环境管理体系认证</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">11</span>
                    </div>
                    <span className="text-text font-medium">职业健康安全管理体系认证</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">12</span>
                    </div>
                    <span className="text-text font-medium">GC2级压力管道安装资质</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">13</span>
                    </div>
                    <span className="text-text font-medium">企业资信等级AAA级企业</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">14</span>
                    </div>
                    <span className="text-text font-medium">企业守合同重信用企业</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">15</span>
                    </div>
                    <span className="text-text font-medium">2024年度更新改造示范工程商</span>
                  </div>
                </div>
              </div>
            </div>
            
            <CertificateGallery certificates={certificates} />
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
              核心服务优势
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: '100%正品保障', desc: '霍尼韦尔官方授权，所有产品均为原厂正品' },
                { title: '专业技术支持', desc: '资深工程师团队提供选型配套与技术咨询' },
                { title: '本地化快速响应', desc: '武汉及湖北区域24小时内响应上门服务' },
                { title: '完善售后体系', desc: '提供安装指导、调试、维保一体化服务' },
              ].map((item, index) => (
                <div key={index} className="bg-background rounded-xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-lg text-text mb-3">{item.title}</h3>
                  <p className="text-text-secondary text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
              联系方式
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {
                [
                  {
                    title: '咨询热线', content: '13907117179', icon: '📞' },
                  {
                    title: '电子邮箱', content: 'info@hubeikexinda.com', icon: '📧' },
                  {
                    title: '工作时间', content: '周一至周五 8:30-17:30', icon: '⏰' },
                  {
                    title: '公司地址', content: '武汉经济技术开发区', icon: '📍' },
                ].map((item, index) => (
                  <div key={index} className="bg-background rounded-xl p-6 border border-gray-100 text-center">
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="font-semibold text-text mb-2">{item.title}</h3>
                    <p className="text-text-secondary">{item.content}</p>
                    {item.title === '咨询热线' && (
                      <a 
                        href="tel:13907117179" 
                        className="text-primary hover:underline cursor-pointer mt-2 inline-block font-medium"
                        title="点击拨打咨询热线"
                      >
                        点击拨打
                      </a>
                    )}
                  </div>
                ))
              }
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="font-heading font-semibold text-2xl text-text mb-8">
                  在线咨询
                </h2>
                
                <div className="bg-slate-50 rounded-xl p-8 border border-gray-100">
                  <form className="space-y-6">
                    <div>
                      <label className="block text-text font-medium mb-2">姓名 <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-background text-text"
                        placeholder="请输入您的姓名"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-text font-medium mb-2">联系电话 <span className="text-red-500">*</span></label>
                      <input 
                        type="tel" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-background text-text"
                        placeholder="请输入联系电话"
                        required
                      />
                    </div>

                    <div className="hidden md:block">
                      <label className="block text-text font-medium mb-2">公司名称</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-background text-text"
                        placeholder="请输入公司名称"
                      />
                    </div>

                    <div className="hidden md:block">
                      <label className="block text-text font-medium mb-2">项目类型</label>
                      <select className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-background text-text">
                        <option value="">请选择项目类型</option>
                        <option value="commercial">商业综合体</option>
                        <option value="hotel">酒店</option>
                        <option value="hospital">医院</option>
                        <option value="industrial">工业厂房</option>
                        <option value="other">其他</option>
                      </select>
                    </div>

                    <div className="hidden md:block">
                      <label className="block text-text font-medium mb-2">需求描述</label>
                      <textarea 
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-background text-text"
                        rows={4}
                        placeholder="请描述您的需求..."
                      ></textarea>
                    </div>

                    <div className="hidden md:block">
                      <label className="block text-text font-medium mb-2">预算范围</label>
                      <select className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-background text-text">
                        <option value="">请选择预算范围</option>
                        <option value="10w以下">10万以下</option>
                        <option value="10w-50w">10万-50万</option>
                        <option value="50w-100w">50万-100万</option>
                        <option value="100w以上">100万以上</option>
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 cursor-pointer"
                    >
                      提交咨询
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="font-heading font-semibold text-2xl text-text mb-8">
                    微信咨询
                  </h2>
                  <div className="bg-slate-50 rounded-xl p-8 border border-gray-100 text-center">
                    <div className="w-48 h-48 bg-white border border-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-text-secondary text-sm">微信二维码</span>
                    </div>
                    <p className="text-text font-medium mb-2">扫描二维码添加微信</p>
                    <p className="text-text-secondary text-sm">获取实时技术支持</p>
                  </div>
                </div>

                <div>
                  <h2 className="font-heading font-semibold text-2xl text-text mb-8">
                    公司地址
                  </h2>
                  <div className="bg-slate-50 rounded-xl p-8 border border-gray-100">
                    <h3 className="font-semibold text-text mb-4">办公地址</h3>
                    <p className="text-text-secondary mb-4">
                      武汉经济技术开发区车城东路10号创思汇科技大厦1109室
                    </p>
                    <h3 className="font-semibold text-text mb-4">乘车路线</h3>
                    <ul className="text-text-secondary space-y-2">
                      <li>• 地铁3号线 沌阳大道站 步行10分钟</li>
                      <li>• 公交 202路/261路 车城东路站</li>
                    </ul>
                    <div className="mt-6">
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-text-secondary text-sm">地图位置</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
              合作流程
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '01', title: '需求沟通', desc: '了解您的项目需求' },
                { step: '02', title: '方案设计', desc: '定制阀门选型方案' },
                { step: '03', title: '产品供应', desc: '霍尼韦尔正品阀门' },
                { step: '04', title: '技术服务', desc: '安装调试与售后' },
              ].map((item, index) => (
                <div key={index} className="bg-background rounded-xl p-6 text-center border border-gray-100">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-text mb-2">{item.title}</h3>
                  <p className="text-text-secondary text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
