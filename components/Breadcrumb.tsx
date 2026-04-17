import Link from 'next/link'
import { generateBreadcrumbJsonLd } from '@/lib/seo'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

/**
 * 面包屑导航组件
 * SEO优化：百度SEO内链规则，清晰的页面层级，BreadcrumbList结构化数据
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
  const jsonLdItems = items.map((item, index) => ({
    name: item.label,
    item: item.href || `#item-${index + 1}`,
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbJsonLd(jsonLdItems)),
        }}
      />
      <nav className="py-4" aria-label="面包屑导航">
        <div className="max-w-6xl mx-auto px-4">
          <ol className="flex items-center space-x-2 text-sm">
            {items.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-text-secondary">/</span>
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-text-secondary hover:text-primary transition-colors duration-200 cursor-pointer"
                    title={item.label}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-text font-medium" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  )
}