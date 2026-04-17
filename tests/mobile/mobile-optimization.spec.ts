import { test, expect } from '@playwright/test'

test.describe('任务组3.2：移动端优化测试', () => {
  test('1. 移动端表单字段简化', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/contact')
    const requiredFields = await page.locator('input[required], textarea[required]').count()
    expect(requiredFields).toBeLessThanOrEqual(4)
  })

  test('2. 移动端页面加载速度', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(10000)
  })

  test('3. 移动端底部导航栏显示', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page.locator('nav.fixed.bottom-0')).toBeVisible()
    await expect(page.locator('nav.fixed.bottom-0').locator('text=首页')).toBeVisible()
    await expect(page.locator('nav.fixed.bottom-0').locator('text=产品')).toBeVisible()
    await expect(page.locator('nav.fixed.bottom-0').locator('text=联系')).toBeVisible()
    await expect(page.locator('nav.fixed.bottom-0').locator('text=技术')).toBeVisible()
  })

  test('4. 移动端底部导航栏链接正常工作', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    await page.locator('nav.fixed.bottom-0').locator('text=产品').click()
    await expect(page).toHaveURL(/products/)
    await page.goto('/')
    
    await page.locator('nav.fixed.bottom-0').locator('text=技术').click()
    await expect(page).toHaveURL(/selection-guide/)
  })

  test('5. 页面无JavaScript错误', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForTimeout(1000)
    await page.goto('/contact')
    await page.waitForTimeout(1000)
    
    expect(errors.length).toBe(0)
  })
})
