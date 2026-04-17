import { test, expect } from '@playwright/test'

test.describe('首页测试', () => {
  test('首页应该能正常加载', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/霍尼韦尔阀门湖北代理商/)
  })

  test('首页应该有H1标题', async ({ page }) => {
    await page.goto('/')
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    await expect(h1).toContainText('霍尼韦尔阀门')
  })

  test('首页应该有导航栏', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav.sticky.top-0')).toBeVisible()
  })

  test('首页应该有页脚', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('footer')).toBeVisible()
  })

  test('导航链接应该能正常点击', async ({ page }) => {
    await page.goto('/')
    // 使用 first() 处理多个相同链接的情况（导航栏和页脚都有）
    await page.getByRole('navigation').getByRole('link', { name: '产品中心' }).click()
    await expect(page).toHaveURL(/products/, { timeout: 10000 })
  })
})
