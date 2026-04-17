import { test, expect } from '@playwright/test'

test.describe('任务组3.1：CTA优化测试', () => {
  test('1. 产品详情页CTA按钮正常工作', async ({ page }) => {
    await page.goto('/products/honeywell-v5011-steam-valve')
    await expect(page.locator('a[href="/contact"]').first()).toBeVisible()
    await page.locator('a[href="/contact"]').first().click()
    await expect(page).toHaveURL(/.*contact/)
  })

  test('2. 知识库文章CTA按钮正常工作', async ({ page }) => {
    await page.goto('/selection-guide/v5011b2w-selection-guide')
    await expect(page.locator('a[href="/contact"]').first()).toBeVisible()
    await page.locator('a[href="/contact"]').first().click()
    await expect(page).toHaveURL(/.*contact/)
  })

  test('3. 案例页CTA按钮正常工作', async ({ page }) => {
    await page.goto('/cases/tongji-hospital')
    await expect(page.locator('a[href="/selection-guide"]').first()).toBeVisible()
    await page.locator('a[href="/selection-guide"]').first().click()
    await expect(page).toHaveURL(/.*selection-guide/)
  })

  test('4. 页面无JavaScript错误', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    
    await page.goto('/products/honeywell-v5011-steam-valve')
    await page.waitForTimeout(1000)
    await page.goto('/selection-guide/v5011b2w-selection-guide')
    await page.waitForTimeout(1000)
    await page.goto('/cases/tongji-hospital')
    await page.waitForTimeout(1000)
    
    expect(errors.length).toBe(0)
  })
})
