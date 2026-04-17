'use client'

import { useEffect } from 'react'

/**
 * 百度统计事件追踪工具
 * SEO优化：事件追踪用于监控用户行为和转化
 */

/**
 * 追踪百度统计事件
 * @param category - 事件分类（如：询盘、下载、点击等）
 * @param action - 事件动作（如：提交、下载、查看等）
 * @param label - 事件标签（如：产品页、首页等）
 * @param value - 事件值（可选）
 */
export function trackBaiduEvent(
  category: string,
  action: string,
  label: string = '',
  value?: number
) {
  if (typeof window !== 'undefined' && (window as any)._hmt) {
    try {
      const eventData: any[] = ['_trackEvent', category, action]
      if (label) {
        eventData.push(label)
      }
      if (value !== undefined) {
        eventData.push(value)
      }
      ;(window as any)._hmt.push(eventData)
      console.log(`[百度统计] 事件追踪: ${category} - ${action} - ${label}`)
    } catch (error) {
      console.error('[百度统计] 事件追踪失败:', error)
    }
  } else {
    console.log(`[百度统计] 事件追踪（模拟）: ${category} - ${action} - ${label}`)
  }
}

/**
 * 追踪询盘提交事件
 * @param page - 页面名称
 */
export function trackInquirySubmit(page: string = '未知页面') {
  trackBaiduEvent('询盘', '提交', page)
}

/**
 * 追踪电话拨打事件
 * @param phoneNumber - 电话号码
 */
export function trackPhoneCall(phoneNumber: string = '13907117179') {
  trackBaiduEvent('电话', '拨打', phoneNumber)
}

/**
 * 追踪PDF下载事件
 * @param fileName - 文件名称
 */
export function trackPdfDownload(fileName: string = '未知文件') {
  trackBaiduEvent('下载', 'PDF', fileName)
}

/**
 * 追踪案例查看事件
 * @param caseName - 案例名称
 */
export function trackCaseView(caseName: string = '未知案例') {
  trackBaiduEvent('案例', '查看', caseName)
}

/**
 * 追踪产品查看事件
 * @param productName - 产品名称
 */
export function trackProductView(productName: string = '未知产品') {
  trackBaiduEvent('产品', '查看', productName)
}

/**
 * 追踪选型工具使用事件
 * @param action - 操作类型
 */
export function trackSelectionTool(action: string = '使用') {
  trackBaiduEvent('选型工具', action, '在线选型')
}

/**
 * 追踪页面停留时间（超过30秒）
 * @param page - 页面名称
 * @param duration - 停留时间（秒）
 */
export function trackPageStay(page: string, duration: number) {
  if (duration > 30) {
    trackBaiduEvent('页面', '停留', page, Math.floor(duration))
  }
}

/**
 * 百度统计事件追踪Hook
 * 用于在组件中自动追踪页面停留
 */
export function useBaiduAnalytics(pageName: string) {
  useEffect(() => {
    const startTime = Date.now()
    
    const handleBeforeUnload = () => {
      const duration = Math.floor((Date.now() - startTime) / 1000)
      trackPageStay(pageName, duration)
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      handleBeforeUnload()
    }
  }, [pageName])
}

export default {
  trackBaiduEvent,
  trackInquirySubmit,
  trackPhoneCall,
  trackPdfDownload,
  trackCaseView,
  trackProductView,
  trackSelectionTool,
  trackPageStay,
  useBaiduAnalytics
}