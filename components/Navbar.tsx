'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { trackPhoneCall } from '@/lib/baidu-analytics'

/**
 * 导航栏组件
 * SEO优化：固定顶部，语义化nav标签，所有链接带title属性
 */
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const handlePhoneClick = () => {
    trackPhoneCall('13907117179')
  }

  // 判断当前路径是否匹配导航链接
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  return (
    <nav className="sticky top-0 bg-background border-b border-gray-100 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-3 cursor-pointer"
            title="湖北科信达机电设备有限公司首页"
          >
            <div className="w-12 h-12 bg-cta rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-base">科信达</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-heading font-semibold text-text text-base whitespace-nowrap">湖北科信达机电设备有限公司</p>
              <p className="text-xs text-text-secondary whitespace-nowrap">霍尼韦尔阀门湖北授权代理商</p>
            </div>
            <div className="sm:hidden">
              <p className="font-heading font-semibold text-text text-lg">科信达</p>
              <p className="text-xs text-text-secondary">霍尼韦尔阀门</p>
            </div>
          </Link>

          {/* 桌面导航 */}
          <div className="hidden lg:flex items-center gap-6">
            <Link 
              href="/" 
              className={`${isActive('/') ? 'text-text' : 'text-text-secondary'} hover:text-cta transition-colors duration-200 cursor-pointer font-medium relative`}
              title="首页"
            >
              首页
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-cta transition-transform duration-200 ${isActive('/') ? 'transform scale-x-100' : 'transform scale-x-0 hover:scale-x-100'}`}></span>
            </Link>
            <Link 
              href="/products" 
              className={`${isActive('/products') ? 'text-text' : 'text-text-secondary'} hover:text-cta transition-colors duration-200 cursor-pointer font-medium relative`}
              title="产品中心"
            >
              产品中心
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-cta transition-transform duration-200 ${isActive('/products') ? 'transform scale-x-100' : 'transform scale-x-0 hover:scale-x-100'}`}></span>
            </Link>
            <Link 
              href="/selection-guide" 
              className={`${isActive('/selection-guide') ? 'text-text' : 'text-text-secondary'} hover:text-cta transition-colors duration-200 cursor-pointer font-medium relative`}
              title="技术支持"
            >
              技术支持
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-cta transition-transform duration-200 ${isActive('/selection-guide') ? 'transform scale-x-100' : 'transform scale-x-0 hover:scale-x-100'}`}></span>
            </Link>
            <Link 
              href="/selection-tool" 
              className={`${isActive('/selection-tool') ? 'text-text' : 'text-text-secondary'} hover:text-cta transition-colors duration-200 cursor-pointer font-medium relative`}
              title="选型工具"
            >
              选型工具
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-cta transition-transform duration-200 ${isActive('/selection-tool') ? 'transform scale-x-100' : 'transform scale-x-0 hover:scale-x-100'}`}></span>
            </Link>
            <Link 
              href="/cases" 
              className={`${isActive('/cases') ? 'text-text' : 'text-text-secondary'} hover:text-cta transition-colors duration-200 cursor-pointer font-medium relative`}
              title="案例中心"
            >
              案例中心
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-cta transition-transform duration-200 ${isActive('/cases') ? 'transform scale-x-100' : 'transform scale-x-0 hover:scale-x-100'}`}></span>
            </Link>
            <Link 
              href="/news" 
              className={`${isActive('/news') ? 'text-text' : 'text-text-secondary'} hover:text-cta transition-colors duration-200 cursor-pointer font-medium relative`}
              title="新闻资讯"
            >
              新闻资讯
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-cta transition-transform duration-200 ${isActive('/news') ? 'transform scale-x-100' : 'transform scale-x-0 hover:scale-x-100'}`}></span>
            </Link>
            <Link 
              href="/contact" 
              className={`${isActive('/contact') ? 'text-text' : 'text-text-secondary'} hover:text-cta transition-colors duration-200 cursor-pointer font-medium relative`}
              title="联系我们"
            >
              联系我们
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-cta transition-transform duration-200 ${isActive('/contact') ? 'transform scale-x-100' : 'transform scale-x-0 hover:scale-x-100'}`}></span>
            </Link>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="lg:hidden flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="菜单"
            >
              <div className="w-6 h-0.5 bg-text mb-1.5"></div>
              <div className="w-6 h-0.5 bg-text mb-1.5"></div>
              <div className="w-6 h-0.5 bg-text"></div>
            </button>
          </div>

          <a 
            href="tel:13907117179" 
            className="hidden sm:block bg-cta hover:bg-cta/90 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer whitespace-nowrap shadow-md hover:shadow-lg"
            title="咨询电话：13907117179"
            onClick={handlePhoneClick}
          >
            139 0711 7179
          </a>
        </div>

        {/* 移动端导航菜单 */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <Link 
                href="/" 
                className={`${isActive('/') ? 'text-text' : 'text-text-secondary'} hover:text-cta transition-colors duration-200 cursor-pointer font-medium py-2`}
                title="首页"
                onClick={() => setIsMenuOpen(false)}
              >
                首页
              </Link>
              <Link 
                href="/products" 
                className={`${isActive('/products') ? 'text-text' : 'text-text-secondary'} hover:text-cta transition-colors duration-200 cursor-pointer font-medium py-2`}
                title="产品中心"
                onClick={() => setIsMenuOpen(false)}
              >
                产品中心
              </Link>
              <Link 
                href="/selection-guide" 
                className={`${isActive('/selection-guide') ? 'text-text' : 'text-text-secondary'} hover:text-cta transition-colors duration-200 cursor-pointer font-medium py-2`}
                title="技术支持"
                onClick={() => setIsMenuOpen(false)}
              >
                技术支持
              </Link>
              <Link 
                href="/selection-tool" 
                className={`${isActive('/selection-tool') ? 'text-text' : 'text-text-secondary'} hover:text-cta transition-colors duration-200 cursor-pointer font-medium py-2`}
                title="选型工具"
                onClick={() => setIsMenuOpen(false)}
              >
                选型工具
              </Link>
              <Link 
                href="/cases" 
                className={`${isActive('/cases') ? 'text-text' : 'text-text-secondary'} hover:text-cta transition-colors duration-200 cursor-pointer font-medium py-2`}
                title="案例中心"
                onClick={() => setIsMenuOpen(false)}
              >
                案例中心
              </Link>
              <Link 
                href="/news" 
                className={`${isActive('/news') ? 'text-text' : 'text-text-secondary'} hover:text-cta transition-colors duration-200 cursor-pointer font-medium py-2`}
                title="新闻资讯"
                onClick={() => setIsMenuOpen(false)}
              >
                新闻资讯
              </Link>
              <Link 
                href="/contact" 
                className={`${isActive('/contact') ? 'text-text' : 'text-text-secondary'} hover:text-cta transition-colors duration-200 cursor-pointer font-medium py-2`}
                title="联系我们"
                onClick={() => setIsMenuOpen(false)}
              >
                联系我们
              </Link>
              <a 
                href="tel:139 0711 7179" 
                className="bg-cta hover:bg-cta/90 text-white px-5 py-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer text-center"
                title="咨询电话：139 0711 7179"
              >
                139 0711 7179
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}