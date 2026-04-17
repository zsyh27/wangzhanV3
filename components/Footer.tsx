import Link from 'next/link'
import Image from 'next/image'

/**
 * 页脚组件
 * SEO优化：语义化footer标签，完整内链网络，备案信息
 */
export default function Footer() {
  return (
    <footer className="bg-cta text-white pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-cta font-bold text-sm whitespace-nowrap">科信达</span>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-xs whitespace-nowrap">湖北科信达机电设备有限公司</h3>
                <p className="text-orange-100 text-xs whitespace-nowrap">霍尼韦尔阀门湖北授权代理商</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a href="/contact" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200" title="微信">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.68 3.01C4.75 3.79 2 7.21 2 11.5c0 4.29 2.75 8.71 8.68 11.49.92.37 1.92-.3 1.92-1.27v-3.03c-3.19.73-3.94-1.83-3.94-1.83-.84-2.17-2.07-2.76-2.07-2.76-1.68-.98.12-.96.12-.96 1.8 0 2.76 1.8 2.76 1.8 1.65 2.76 4.08 1.41 5.12 1.07.35-1.05.47-2.27.47-3.45 0-7.77-4.6-13.05-11.5-13.05zm0 18.98c-4.05-2.58-6.68-6.28-6.68-10.48 0-3.87 2.43-7.25 7.05-8.29 1.43-.26 2.93.56 2.93.56 1.86.83 2.7 2.31 2.7 2.31 1.31 2.39-.5 4.57-1.97 5.42-.64.36-1.19.83-1.59 1.34-.27.33-.4.78-.4 1.27v2.88c0 .66 1.06 1.59 1.92 1.27z"/>
                </svg>
              </a>
              <a href="/contact" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200" title="电话">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1zM18 9h-2.5c-.8 0-1.5-.7-1.5-1.5S14.7 6 15.5 6H18c.6 0 1 .4 1 1s-.4 1-1 1z"/>
                </svg>
              </a>
              <a href="/contact" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200" title="邮箱">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-4">快速链接</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link 
                  href="/" 
                  className="text-orange-100 hover:text-white transition-colors duration-200 cursor-pointer flex items-center gap-1"
                  title="首页"
                >
                  首页
                </Link>
              </li>
              <li>
                <Link 
                  href="/products" 
                  className="text-orange-100 hover:text-white transition-colors duration-200 cursor-pointer flex items-center gap-1"
                  title="产品中心"
                >
                  产品中心
                </Link>
              </li>
              <li>
                <Link 
                  href="/selection-guide" 
                  className="text-orange-100 hover:text-white transition-colors duration-200 cursor-pointer flex items-center gap-1"
                  title="技术支持"
                >
                  技术支持
                </Link>
              </li>
              <li>
                <Link 
                  href="/selection-tool" 
                  className="text-orange-100 hover:text-white transition-colors duration-200 cursor-pointer flex items-center gap-1"
                  title="选型工具"
                >
                  选型工具
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-4">更多内容</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link 
                  href="/cases" 
                  className="text-orange-100 hover:text-white transition-colors duration-200 cursor-pointer flex items-center gap-1"
                  title="案例中心"
                >
                  案例中心
                </Link>
              </li>
              <li>
                <Link 
                  href="/news" 
                  className="text-orange-100 hover:text-white transition-colors duration-200 cursor-pointer flex items-center gap-1"
                  title="新闻资讯"
                >
                  新闻资讯
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-orange-100 hover:text-white transition-colors duration-200 cursor-pointer flex items-center gap-1"
                  title="联系我们"
                >
                  联系我们
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-4">联系方式</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-orange-100">电话咨询</p>
                  <p className="text-white font-medium">139 0711 7179</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-orange-100">公司地址</p>
                  <p className="text-white">武汉经济技术开发区车城东路10号创思汇科技大厦11层</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-orange-100">工作时间</p>
                  <p className="text-white">周一至周五 9:00-18:00</p>
                </div>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-3">企业微信</h4>
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg flex-shrink-0">
                <Image
                  src="/images/wechat-qr.png"
                  alt="湖北科信达企业微信服务号二维码"
                  width={80}
                  height={80}
                  className="w-14 h-14"
                />
              </div>
              <p className="text-orange-100 text-xs">
                扫码关注企业微信，获取更多产品资讯。
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
            <p className="text-orange-100">© 2026 湖北科信达机电设备有限公司 版权所有</p>
            <div className="flex flex-col md:flex-row gap-4 text-orange-100">
              <p>鄂ICP备XXXXXXXX号-X</p>
              <p>鄂公网安备 XXXXXXXXXXXX号</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
