'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { trackPhoneCall } from '@/lib/baidu-analytics'

/**
 * 移动端底部导航栏组件
 * 仅在移动端显示，提供快速访问核心功能
 */
export default function MobileBottomNav() {
  const pathname = usePathname()

  const handlePhoneClick = () => {
    trackPhoneCall('13907117179')
  }

  const navItems = [
    { href: '/', label: '首页', icon: '🏠' },
    { href: '/products', label: '产品', icon: '🛒' },
    { href: '/contact', label: '联系', icon: '📞', phone: true },
    { href: '/selection-guide', label: '技术', icon: '📚' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-gray-100 z-50 md:hidden">
      <div className="grid grid-cols-4 gap-0">
        {navItems.map((item, index) => (
          item.phone ? (
            <a
              key={index}
              href="tel:13907117179"
              onClick={handlePhoneClick}
              className="flex flex-col items-center py-3 px-2 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs text-text font-medium">{item.label}</span>
            </a>
          ) : (
            <Link
              key={index}
              href={item.href}
              className={`flex flex-col items-center py-3 px-2 hover:bg-gray-50 transition-colors cursor-pointer ${
                isActive(item.href) ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        ))}
      </div>
      <div className="h-2 bg-background" />
    </nav>
  )
}
