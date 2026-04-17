import { test, expect } from '@playwright/test'

test.describe('任务组1.2：导航结构优化测试', () => {
  test('1. 桌面端导航栏显示正确的名称', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav.sticky.top-0')).toBeVisible()
    await expect(page.locator('nav.sticky.top-0')).toContainText('技术支持')
    await expect(page.locator('nav.sticky.top-0')).toContainText('选型工具')
  })

  test('2. 桌面端导航链接正常工作', async ({ page }) => {
    await page.goto('/')
    await page.click('nav.sticky.top-0 >> text=技术支持')
    await expect(page).toHaveURL(/.*selection-guide/)
    
    await page.goto('/')
    await page.click('nav.sticky.top-0 >> text=选型工具')
    await expect(page).toHaveURL(/.*selection-tool/)
  })

  test('3. 移动端导航显示正确的名称', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.click('button[aria-label="菜单"]')
    const mobileMenu = page.locator('.mt-4.py-4.border-t')
    await expect(mobileMenu).toBeVisible()
    await expect(mobileMenu).toContainText('技术支持')
    await expect(mobileMenu).toContainText('选型工具')
  })

  test('4. 移动端导航链接正常工作', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.click('button[aria-label="菜单"]')
    const mobileMenu = page.locator('.mt-4.py-4.border-t')
    await expect(mobileMenu).toBeVisible()
    await mobileMenu.locator('text=技术支持').click()
    await expect(page).toHaveURL(/.*selection-guide/)
    
    await page.goto('/')
    await page.click('button[aria-label="菜单"]')
    await mobileMenu.locator('text=选型工具').click()
    await expect(page).toHaveURL(/.*selection-tool/)
  })

  test('5. 页面无JavaScript错误', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    await page.waitForTimeout(2000)
    expect(errors.length).toBe(0)
  })
})
