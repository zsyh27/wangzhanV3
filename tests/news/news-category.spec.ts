import { test, expect } from '@playwright/test'

test.describe('任务组1.4：新闻栏目定位调整测试', () => {
  test('1. 新闻页面包含分类筛选', async ({ page }) => {
    await page.goto('/news')
    await expect(page.locator('text=全部')).toBeVisible()
  })

  test('2. 分类筛选按钮可点击', async ({ page }) => {
    await page.goto('/news')
    const allButton = page.locator('button:text("全部")')
    await expect(allButton).toBeEnabled()
  })

  test('3. 页面无JavaScript错误', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/news')
    await page.waitForTimeout(2000)
    expect(errors.length).toBe(0)
  })
})
