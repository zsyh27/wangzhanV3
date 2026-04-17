import { test, expect } from '@playwright/test'

test.describe('页面功能测试', () => {
  test('产品中心页面应该能正常显示', async ({ page }) => {
    await page.goto('/products')
    await expect(page.locator('h1')).toContainText('产品中心')
    // 使用 first() 处理多个匹配元素
    await expect(page.getByText('霍尼韦尔').first()).toBeVisible()
  })

  test('选型指南页面应该能正常显示', async ({ page }) => {
    await page.goto('/selection-guide')
    await expect(page.locator('h1')).toContainText('技术支持')
  })

  test('案例中心页面应该能正常显示', async ({ page }) => {
    await page.goto('/cases')
    // 实际H1是"暖通阀门项目案例"
    await expect(page.locator('h1')).toContainText('暖通阀门项目案例')
  })

  test('新闻资讯页面应该能正常显示', async ({ page }) => {
    await page.goto('/news')
    // 实际H1是"暖通行业资讯与技术干货"
    await expect(page.locator('h1')).toContainText('暖通行业资讯与技术干货')
  })



  test('联系我们页面应该能正常显示', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.locator('h1')).toContainText('联系我们')
  })
})
