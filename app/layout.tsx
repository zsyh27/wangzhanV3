import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import MobileBottomNav from '@/components/MobileBottomNav'
import { generateOrganizationJsonLd, generateWebPageJsonLd, generateLocalBusinessJsonLd } from '@/lib/seo'

/**
 * 根布局全局默认Metadata配置
 * SEO优化：百度中文站点规则，OG标签，viewport配置
 * 配置读取：所有配置从环境变量读取，避免配置不一致
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://www.hubeikexinda.online'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || '湖北科信达机电设备有限公司'
const BAIDU_TONGJI_ID = process.env.BAIDU_TONGJI_ID || 'YOUR_BAIDU_TONGJI_ID'
const BAIDU_VERIFICATION_CODE = process.env.BAIDU_VERIFICATION_CODE || ''

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - 霍尼韦尔阀门湖北官方授权代理商`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `${SITE_NAME}是霍尼韦尔阀门湖北官方授权代理商，专注武汉及湖北区域中央空调阀门供应、选型配套、暖通工程施工，为商业综合体、酒店、医院、工业厂房提供正品霍尼韦尔阀门与本地化服务。`,
  keywords: '霍尼韦尔阀门,湖北霍尼韦尔代理,中央空调阀门,暖通工程,湖北科信达',
  authors: [{ name: '湖北科信达' }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - 霍尼韦尔阀门湖北官方授权代理商`,
    description: `${SITE_NAME}是霍尼韦尔阀门湖北官方授权代理商，专注武汉及湖北区域中央空调阀门供应、选型配套、暖通工程施工。`,
    images: [
      {
        url: `${SITE_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: '霍尼韦尔阀门湖北官方授权代理商',
    images: [`${SITE_URL}/images/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '',
    yandex: '',
    yahoo: '',
    other: BAIDU_VERIFICATION_CODE ? {
      'baidu-site-verification': BAIDU_VERIFICATION_CODE,
    } : undefined,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateLocalBusinessJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebPageJsonLd({
              name: SITE_NAME,
              description: '霍尼韦尔阀门湖北官方授权代理商',
              url: SITE_URL,
            })),
          }}
        />
      </head>
      <body className="font-sans bg-background text-text antialiased">
        {children}
        <MobileBottomNav />
        
        {/* 百度统计代码 - 仅在生产环境加载 */}
        <Script
          id="baidu-tongji"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                var _hmt = _hmt || [];
                (function() {
                  try {
                    var hm = document.createElement("script");
                    hm.src = "https://hm.baidu.com/hm.js?${BAIDU_TONGJI_ID}";
                    var s = document.getElementsByTagName("script")[0]; 
                    s.parentNode.insertBefore(hm, s);
                  } catch (e) {
                    console.log('[百度统计] 加载失败:', e);
                  }
                })();
              } else {
                console.log('[百度统计] 开发环境，跳过加载');
                window._hmt = {
                  push: function(args) {
                    console.log('[百度统计] 事件追踪（开发环境）:', args);
                  }
                };
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
