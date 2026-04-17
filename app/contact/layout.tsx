import type { Metadata } from 'next'

/**
 * 联系我们页面SEO元数据配置
 * SEO优化：本地化区域词、联系方式词排名，转化收口
 */
export const metadata: Metadata = {
  title: '联系我们_霍尼韦尔阀门湖北授权代理商_湖北科信达机电设备有限公司',
  description: '联系湖北科信达机电设备有限公司，霍尼韦尔阀门湖北官方授权代理商，咨询电话：13907117179，公司地址：武汉经济技术开发区车城东路10号创思汇科技大厦1109室，为您提供专业的阀门选型与暖通工程服务。',
  keywords: '武汉霍尼韦尔阀门联系电话,湖北暖通阀门厂家地址,湖北科信达机电设备有限公司联系方式',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}