import { test, expect } from '@playwright/test'

test.describe('导航测试', () => {
  test('所有导航链接应该能正常访问', async ({ page }) => {
    await page.goto('/')

    const navLinks = [
      { name: '首页', url: '/' },
      { name: '产品中心', url: '/products' },
      { name: '技术支持', url: '/selection-guide' },
      { name: '案例中心', url: '/cases' },
      { name: '新闻资讯', url: '/news' },
      { name: '联系我们', url: '/contact' },
    ]

    for (const link of navLinks) {
      await page.locator('nav.sticky.top-0').getByRole('link', { name: link.name }).click()
      await expect(page).toHaveURL(new RegExp(link.url))
      await page.goto('/')
    }
  })

  test('Logo链接应该跳转到首页', async ({ page }) => {
    await page.goto('/products')
    await page.getByRole('link', { name: /湖北科信达/ }).first().click()
    await expect(page).toHaveURL('/')
  })
})
