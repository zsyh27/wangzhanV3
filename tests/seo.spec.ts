import { test, expect } from '@playwright/test'

test.describe('SEO测试', () => {
  test('每个页面应该有正确的title', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    expect(title).toContain('湖北科信达')
  })

  test('页面应该有meta description', async ({ page }) => {
    await page.goto('/')
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content')
  })

  test('页面应该有正确的language', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  })
})
