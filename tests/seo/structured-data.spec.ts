import { test, expect } from '@playwright/test'

test.describe('任务组1.1：技术SEO优化测试', () => {
  test('1. LocalBusiness结构化数据存在且正确', async ({ page }) => {
    await page.goto('/')
    const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(structuredData.some(data => data.includes('LocalBusiness'))).toBeTruthy()
    expect(structuredData.some(data => data.includes('湖北科信达'))).toBeTruthy()
  })

  test('2. 页面包含Organization结构化数据', async ({ page }) => {
    await page.goto('/')
    const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(structuredData.some(data => data.includes('Organization'))).toBeTruthy()
  })

  test('3. 页面包含WebPage结构化数据', async ({ page }) => {
    await page.goto('/')
    const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(structuredData.some(data => data.includes('WebPage'))).toBeTruthy()
  })

  test('4. BreadcrumbList结构化数据存在且正确', async ({ page }) => {
    await page.goto('/products/v5011s2s')
    const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(structuredData.some(data => data.includes('BreadcrumbList'))).toBeTruthy()
  })

  test('5. 产品详情页包含Product结构化数据', async ({ page }) => {
    await page.goto('/products/v5011s2s')
    const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(structuredData.some(data => data.includes('Product'))).toBeTruthy()
    expect(structuredData.some(data => data.includes('霍尼韦尔'))).toBeTruthy()
  })

  test('6. 技术文章页面包含FAQPage结构化数据', async ({ page }) => {
    await page.goto('/selection-guide/valve-selection-guide')
    const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(structuredData.some(data => data.includes('FAQPage'))).toBeTruthy()
  })

  test('7. 所有图片都有Alt标签', async ({ page }) => {
    await page.goto('/')
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
      expect(alt.length).toBeGreaterThan(0)
    }
  })

  test('8. 页面无JavaScript错误', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    await page.waitForTimeout(2000)
    expect(errors.length).toBe(0)
  })

  test('9. 页面有正确的title', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    expect(title).toContain('湖北科信达')
    expect(title).toContain('霍尼韦尔阀门')
  })

  test('10. 页面有meta description', async ({ page }) => {
    await page.goto('/')
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content')
    const content = await metaDescription.getAttribute('content')
    expect(content?.length).toBeGreaterThan(0)
  })

  test('11. 页面有正确的language', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  })
})
