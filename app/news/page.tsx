import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getAllContent, NewsFrontmatter } from '@/lib/markdown'
import NewsList from './NewsList'

// 禁用静态生成，确保每次请求都获取最新数据
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: '暖通行业资讯_阀门技术干货_霍尼韦尔阀门湖北代理商_湖北科信达机电设备有限公司',
  description: '湖北科信达机电设备有限公司为您提供暖通行业最新资讯、霍尼韦尔阀门技术干货、中央空调阀门选型技巧、安装维保指南，专业内容持续更新。',
  keywords: '中央空调阀门技术,暖通行业资讯,阀门选型指南,武汉暖通干货',
}

export default async function NewsPage() {
  const news = await getAllContent<NewsFrontmatter>('news')
  
  return (
    <Suspense fallback={null}>
      <NewsList news={news} />
    </Suspense>
  )
}
