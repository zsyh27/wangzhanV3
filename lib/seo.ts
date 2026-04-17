const BASE_URL = 'http://www.hubeikexinda.online'

interface BreadcrumbItem {
  name: string
  item: string
}

/**
 * 生成面包屑导航JSON-LD结构化数据
 * SEO优化：百度搜索资源平台结构化数据规范
 */
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  }
}

/**
 * 生成企业信息JSON-LD结构化数据
 * SEO优化：首页企业信息展示
 */
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '湖北科信达机电设备有限公司',
    alternateName: '湖北科信达',
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo.png`,
    description: '湖北科信达机电设备有限公司是霍尼韦尔阀门湖北官方授权代理商，专注武汉及湖北区域中央空调阀门供应、选型配套、暖通工程施工，为商业综合体、酒店、医院、工业厂房提供正品霍尼韦尔阀门与本地化服务。',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '武汉经济技术开发区车城东路10号创思汇科技大厦1109室',
      addressLocality: '武汉市',
      addressRegion: '湖北省',
      postalCode: '430000',
      addressCountry: 'CN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+86-139 0711 7179',
      contactType: 'customer service',
      availableLanguage: ['Chinese'],
    },
    sameAs: [
      'http://www.hubeikexinda.online',
    ],
  }
}

/**
 * 生成产品JSON-LD结构化数据
 * SEO优化：产品详情页展示
 */
export function generateProductJsonLd(data: {
  name: string
  seoDescription: string
  image?: string
  brand: string
  model: string
  category: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.seoDescription,
    image: data.image ? `${BASE_URL}${data.image}` : undefined,
    brand: {
      '@type': 'Brand',
      name: data.brand,
    },
    model: data.model,
    category: data.category,
    manufacturer: {
      '@type': 'Organization',
      name: '霍尼韦尔',
    },
  }
}

/**
 * 生成文章信息JSON-LD结构化数据
 * SEO优化：新闻资讯详情页展示
 */
export function generateArticleJsonLd(data: {
  headline: string
  description: string
  author: string
  datePublished: string
  dateModified?: string
  image?: string
  publisher?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline,
    description: data.description,
    author: {
      '@type': 'Person',
      name: data.author,
    },
    publisher: {
      '@type': 'Organization',
      name: data.publisher || '湖北科信达机电设备有限公司',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/logo.png`,
      },
    },
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    image: data.image ? `${BASE_URL}${data.image}` : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': BASE_URL,
    },
  }
}

/**
 * 生成网页JSON-LD结构化数据
 * SEO优化：所有页面通用
 */
export function generateWebPageJsonLd(data: {
  name: string
  description: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.name,
    description: data.description,
    url: data.url,
    publisher: {
      '@type': 'Organization',
      name: '湖北科信达机电设备有限公司',
    },
    inLanguage: 'zh-CN',
  }
}

/**
 * 生成本地商业JSON-LD结构化数据
 * SEO优化：联系我们页展示
 */
export function generateLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: '湖北科信达机电设备有限公司',
    image: `${BASE_URL}/images/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '武汉经济技术开发区车城东路10号创思汇科技大厦1109室',
      addressLocality: '武汉市',
      addressRegion: '湖北省',
      postalCode: '430000',
      addressCountry: 'CN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '30.509',
      longitude: '114.164',
    },
    url: BASE_URL,
    telephone: '+86-13907117179',
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:30',
      closes: '17:30',
    },
  }
}

export function generateFaqJsonLd(faqs: Array<{ question: string, answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}