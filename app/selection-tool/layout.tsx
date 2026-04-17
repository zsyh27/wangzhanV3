import type { Metadata } from 'next'

/**
 * 在线选型工具页面SEO元数据配置
 * SEO优化：选型需求词、技术参数词排名，转化工具页
 */
export const metadata: Metadata = {
  title: '霍尼韦尔阀门选型工具_V5011B2W_V5GV在线选型 - 湖北科信达',
  description: '湖北科信达提供霍尼韦尔阀门在线选型工具，根据工况条件推荐V5011B2W、V5GV等型号阀门，快速找到适合的产品。',
  keywords: '霍尼韦尔阀门选型工具,电动阀在线选型,V5011B2W选型,V5GV选型',
}

export default function SelectionToolLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}