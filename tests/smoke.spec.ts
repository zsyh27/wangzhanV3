import { test, expect } from '@playwright/test'

test.describe('网站冒烟测试 - 主要页面加载测试', () => {
  const mainPages = [
    { path: '/', name: '首页' },
    { path: '/products', name: '产品中心' },
    { path: '/selection-guide', name: '技术支持' },
    { path: '/selection-tool', name: '选型工具' },
    { path: '/cases', name: '案例中心' },
    { path: '/news', name: '新闻资讯' },
    { path: '/contact', name: '联系我们' },
    { path: '/admin', name: '定时任务管理' },
  ]

  for (const pageInfo of mainPages) {
    test(`${pageInfo.name}页面正常加载`, async ({ page }) => {
      await page.goto(pageInfo.path)
      await expect(page.locator('body')).toBeVisible()
    })
  }
})

test.describe('网站冒烟测试 - 内容详情页加载测试', () => {
  const detailPages = [
    { path: '/products/honeywell-v5011-steam-valve', name: '产品详情页' },
    { path: '/selection-guide/v5011b2w-selection-guide', name: '技术文章详情页' },
  ]

  for (const pageInfo of detailPages) {
    test(`${pageInfo.name}正常加载`, async ({ page }) => {
      await page.goto(pageInfo.path)
      await expect(page.locator('body')).toBeVisible()
    })
  }
})
